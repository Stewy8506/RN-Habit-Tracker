package expo.modules.dndcontroller

import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.os.Build
import android.util.Log

class AlarmReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    disableDnd(context)
    startAlarm(context)
  }

  companion object {
    private var mediaPlayer: MediaPlayer? = null
    private const val TAG = "AlarmReceiver"

    fun disableDnd(context: Context) {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return
      val manager = context.applicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager ?: return
      if (!manager.isNotificationPolicyAccessGranted) return
      try {
        manager.setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_ALL)
      } catch (e: Throwable) {
        Log.e(TAG, "Failed to disable DND: ${e.message}", e)
      }
    }

    fun startAlarm(context: Context) {
      val appContext = context.applicationContext
      try {
        stopAlarm()
        val alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
          ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
          ?: return

        val player = MediaPlayer().apply {
          setAudioAttributes(
            AudioAttributes.Builder()
              .setFlags(AudioAttributes.FLAG_AUDIBILITY_ENFORCED)
              .setLegacyStreamType(AudioManager.STREAM_ALARM)
              .setUsage(AudioAttributes.USAGE_ALARM)
              .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
              .build()
          )
          setDataSource(appContext, alarmUri)
          isLooping = true
          prepare()
          start()
        }
        mediaPlayer = player
        Log.d(TAG, "Alarm started successfully.")
      } catch (e: Throwable) {
        Log.e(TAG, "Failed to start alarm: ${e.message}", e)
      }
    }

    fun stopAlarm() {
      try {
        mediaPlayer?.let {
          if (it.isPlaying) {
            it.stop()
          }
          it.release()
        }
        mediaPlayer = null
        Log.d(TAG, "Alarm stopped successfully.")
      } catch (e: Throwable) {
        Log.e(TAG, "Failed to stop alarm: ${e.message}", e)
      }
    }
  }
}
