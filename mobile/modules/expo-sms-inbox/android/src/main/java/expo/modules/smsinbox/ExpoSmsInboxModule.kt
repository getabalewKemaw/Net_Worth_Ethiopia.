package expo.modules.smsinbox

import android.Manifest
import android.content.pm.PackageManager
import android.provider.Telephony
import androidx.core.content.ContextCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoSmsInboxModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoSmsInbox")

    Function("isAvailable") {
      true
    }

    Function("hasSmsPermission") {
      val context = appContext.reactContext ?: return@Function false
      ContextCompat.checkSelfPermission(
        context,
        Manifest.permission.READ_SMS
      ) == PackageManager.PERMISSION_GRANTED
    }

    AsyncFunction("fetchBankSmsMessages") { limit: Int? ->
      val context = appContext.reactContext
        ?: throw IllegalStateException("React context not available")

      val hasPermission = ContextCompat.checkSelfPermission(
        context,
        Manifest.permission.READ_SMS
      ) == PackageManager.PERMISSION_GRANTED

      if (!hasPermission) {
        throw SecurityException("READ_SMS permission is not granted")
      }

      val maxLimit = if (limit != null && limit > 0) limit else 200

      // Whitelist of sender keywords for Ethiopian financial institutions
      val bankSenders = listOf(
        "127", "telebirr", "cbe", "cbebirr", "889", "829",
        "awash", "boa", "abyssinia", "dashen", "amole", "wegagen",
        "coop", "hibret", "enat", "nib", "zemen", "berhan",
        "siinqee", "sinquee", "lion", "oromia", "bunna"
      )

      // Important: Do NOT put LIMIT inside sortOrder string as ContentResolver on Android 10+
      // rejects SQL keywords in sortOrder. Handle limiting inside the cursor loop instead.
      val sortOrder = "${Telephony.Sms.DATE} DESC"

      val projection = arrayOf(
        Telephony.Sms._ID,
        Telephony.Sms.ADDRESS,
        Telephony.Sms.BODY,
        Telephony.Sms.DATE
      )

      val results = mutableListOf<Map<String, Any>>()

      val cursor = context.contentResolver.query(
        Telephony.Sms.Inbox.CONTENT_URI,
        projection,
        null,
        null,
        sortOrder
      )

      cursor?.use {
        val idCol = it.getColumnIndexOrThrow(Telephony.Sms._ID)
        val addressCol = it.getColumnIndexOrThrow(Telephony.Sms.ADDRESS)
        val bodyCol = it.getColumnIndexOrThrow(Telephony.Sms.BODY)
        val dateCol = it.getColumnIndexOrThrow(Telephony.Sms.DATE)

        while (it.moveToNext() && results.size < maxLimit) {
          val id = it.getString(idCol) ?: ""
          val address = it.getString(addressCol) ?: ""
          val body = it.getString(bodyCol) ?: ""
          val date = it.getLong(dateCol)

          val lowerAddress = address.lowercase().trim()
          val lowerBody = body.lowercase()

          // Check if sender matches any known bank or mobile money keyword
          val isBankSender = bankSenders.any { sender -> lowerAddress.contains(sender) }

          // Or if message contains Ethiopian financial transaction signals
          val hasTxKeywords = (lowerBody.contains("etb") || lowerBody.contains("birr") || lowerBody.contains("ብር")) &&
            (lowerBody.contains("credited") || lowerBody.contains("debited") || lowerBody.contains("transferred") ||
             lowerBody.contains("received") || lowerBody.contains("paid") || lowerBody.contains("payment") ||
             lowerBody.contains("balance") || lowerBody.contains("recharged") || lowerBody.contains("ሒሳብ") ||
             lowerBody.contains("ተቀብለዋል") || lowerBody.contains("ተከፍሏል"))

          if (isBankSender || hasTxKeywords) {
            results.add(
              mapOf(
                "id" to id,
                "address" to address,
                "body" to body,
                "date" to date.toDouble()
              )
            )
          }
        }
      }

      return@AsyncFunction results
    }
  }
}

