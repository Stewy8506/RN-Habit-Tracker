package expo.modules.dndcontroller

import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class DndControllerModule : Module() {
  private var lastError: String? = null

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
  }
}
