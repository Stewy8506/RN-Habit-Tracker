package expo.modules.dndcontroller

import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.Ringtone
import android.media.RingtoneManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class DndControllerModule : Module() {
  private var lastError: String? = null
  private var alarmRingtone: Ringtone? = null
  private val mainHandler = Handler(Looper.getMainLooper())

  private val notificationManager: NotificationManager?
    get() = appContext.reactContext?.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager

  private fun currentInterruptionFilter(manager: NotificationManager?): Int {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M || manager == null) {
      return NotificationManager.INTERRUPTION_FILTER_UNKNOWN
    }

    return manager.currentInterruptionFilter
  }

  private fun setDndPolicy(manager: NotificationManager) {
    val policy = NotificationManager.Policy(
      0,
      0,
      0,
      NotificationManager.Policy.SUPPRESSED_EFFECT_FULL_SCREEN_INTENT or
        NotificationManager.Policy.SUPPRESSED_EFFECT_LIGHTS or
        NotificationManager.Policy.SUPPRESSED_EFFECT_PEEK or
        NotificationManager.Policy.SUPPRESSED_EFFECT_STATUS_BAR or
        NotificationManager.Policy.SUPPRESSED_EFFECT_BADGE or
        NotificationManager.Policy.SUPPRESSED_EFFECT_AMBIENT or
        NotificationManager.Policy.SUPPRESSED_EFFECT_NOTIFICATION_LIST
    )

    manager.setNotificationPolicy(policy)
  }

  private fun stopAlarmPlayback() {
    alarmRingtone?.stop()
    alarmRingtone = null
  }

  override fun definition() = ModuleDefinition {
    Name("DndController")

    Function("isAvailable") {
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
    }

    Function("hasPolicyAccess") {
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.M &&
        notificationManager?.isNotificationPolicyAccessGranted == true
    }

    Function("getStatus") {
      val manager = notificationManager
      mapOf(
        "available" to (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M),
        "policyAccessGranted" to (
          Build.VERSION.SDK_INT >= Build.VERSION_CODES.M &&
            manager?.isNotificationPolicyAccessGranted == true
          ),
        "interruptionFilter" to currentInterruptionFilter(manager),
        "lastError" to lastError
      )
    }

    Function("openPolicyAccessSettings") {
      val context = appContext.reactContext ?: return@Function false
      val intent = Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      context.startActivity(intent)
      true
    }

    Function("enableDnd") {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
        lastError = "DND requires Android 6.0 or newer."
        return@Function false
      }

      val manager = notificationManager ?: run {
        lastError = "NotificationManager is unavailable."
        return@Function false
      }

      if (!manager.isNotificationPolicyAccessGranted) {
        lastError = "Do Not Disturb access is not granted in Special app access."
        return@Function false
      }

      try {
        setDndPolicy(manager)
        manager.setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_NONE)
        lastError = null
        currentInterruptionFilter(manager) == NotificationManager.INTERRUPTION_FILTER_NONE
      } catch (error: RuntimeException) {
        lastError = error.message ?: error.javaClass.simpleName
        false
      }
    }

    Function("disableDnd") {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
        lastError = "DND requires Android 6.0 or newer."
        return@Function false
      }

      val manager = notificationManager ?: run {
        lastError = "NotificationManager is unavailable."
        return@Function false
      }

      if (!manager.isNotificationPolicyAccessGranted) {
        lastError = "Do Not Disturb access is not granted in Special app access."
        return@Function false
      }

      try {
        manager.setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_ALL)
        lastError = null
        currentInterruptionFilter(manager) == NotificationManager.INTERRUPTION_FILTER_ALL
      } catch (error: RuntimeException) {
        lastError = error.message ?: error.javaClass.simpleName
        false
      }
    }

    Function("triggerAlarm") {
      val context = appContext.reactContext ?: run {
        lastError = "React context is unavailable."
        return@Function false
      }

      try {
        stopAlarmPlayback()
        val alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
          ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
          ?: run {
            lastError = "No alarm URI is available."
            return@Function false
          }
        val ringtone = RingtoneManager.getRingtone(context, alarmUri) ?: run {
          lastError = "No alarm ringtone is available."
          return@Function false
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
          ringtone.audioAttributes = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_ALARM)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build()
        }

        alarmRingtone = ringtone
        ringtone.play()
        mainHandler.postDelayed({ stopAlarmPlayback() }, 12000)
        lastError = null
        true
      } catch (error: RuntimeException) {
        lastError = error.message ?: error.javaClass.simpleName
        false
      }
    }

    Function("stopAlarm") {
      try {
        stopAlarmPlayback()
        lastError = null
        true
      } catch (error: RuntimeException) {
        lastError = error.message ?: error.javaClass.simpleName
        false
      }
    }
  }
}
