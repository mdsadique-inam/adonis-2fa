---
summary: How set Adonis-2FA Basic flow controller
---

# Controller

This is the controller that we recommend to the basic flow.

```ts
import twoFactorAuth from '@mdsadique-inam/adonisjs-2fa/services/main'
import type { HttpContext } from '@adonisjs/core/http'

import { verifyOtpValidator } from '#validators/verify_otp'

export default class TwoFactorAuthController {
  async generate({ auth }: HttpContext) {
    const user = auth.user!

    const twoFactorSecret = twoFactorAuth.generateSecret(user.email)
    user.twoFactorSecret = twoFactorSecret.secret
    user.isTwoFactorEnabled = false

    await user.save()

    return twoFactorSecret
  }

  async disable({ auth, response }: HttpContext) {
    if (!auth.user!.isTwoFactorEnabled) {
      return response.badRequest({ message: 'User without 2FA active' })
    }

    await auth
      .user!.merge({ isTwoFactorEnabled: false, twoFactorRecoveryCodes: [], twoFactorSecret: null })
      .save()

    return response.noContent()
  }

  async verify({ auth, request, response }: HttpContext) {
    const { otp } = await request.validateUsing(verifyOtpValidator)

    const user = auth.user!

    if (!user.twoFactorSecret) {
      return response.badRequest({ message: 'User without 2FA active' })
    }

    const isValid = twoFactorAuth.verifyToken(
      user.twoFactorSecret,
      otp,
      user.twoFactorRecoveryCodes
    )

    if (!isValid) {
      return response.badRequest({ message: 'OTP invalid' })
    }

    if (!user.isTwoFactorEnabled) {
      await user.merge({ isTwoFactorEnabled: true }).save()
    }

    return response.ok({ message: 'OTP valid' })
  }

  async generateRecoveryCodes({ auth, response }: HttpContext) {
    const user = auth.user!

    if (!user.isTwoFactorEnabled) {
      return response.badRequest({ message: 'User without 2FA active' })
    }

    const recoveryCodes = twoFactorAuth.generateRecoveryCodes()

    await user.merge({ twoFactorRecoveryCodes: recoveryCodes }).save()

    return { recovery_codes: recoveryCodes }
  }
}
```
