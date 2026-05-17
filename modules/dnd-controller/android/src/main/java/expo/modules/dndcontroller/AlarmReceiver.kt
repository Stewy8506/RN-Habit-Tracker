package expo.modules.dndcontroller

import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.Ringtone
import android.media.RingtoneManager
import android.os.Build
import android.os.Handler
import android.os.Looper

class AlarmReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    disableDnd(context)
    startAlarm(context)
  }

  companion object {
    private var alarmRingtone: Ringtone? = null
    private val mainHandler = Handler(Looper.getMainLooper())

    fun disableDnd(context: Context) {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return
      val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager ?: return
      if (!manager.isNotificationPolicyAccessGranted) return
      try {
        manager.setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_ALL)
      } catch (e: Throwable) {
        // ignore
      }
    }

    fun startAlarm(context: Context) {
      mainHandler.post {
        try {
          stopAlarm()
          val alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
            ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
            ?: return@post
          val ringtone = RingtoneManager.getRingtone(context, alarmUri) ?: return@post

          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            ringtone.audioAttributes = AudioAttributes.Builder()
              .setUsage(AudioAttributes.USAGE_ALARM)
              .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
              .build()
          }
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            ringtone.isLooping = true
          }
          alarmRingtone = ringtone
          ringtone.play()
        } catch (e: Throwable) {
          // ignore
        }
      }
    }

    fun stopAlarm() {
      mainHandler.post {
        try {
          alarmRingtone?.stop()
          alarmRingtone = null
        } catch (e: Throwable) {
          // ignore
        }
      }
    }
  }
}
