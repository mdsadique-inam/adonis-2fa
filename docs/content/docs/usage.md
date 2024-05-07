---
summary: How to use Adonis-2FA
---

# Usage

Once the package has been configured, you can interact with 2FA API's using the service to create `Secret` and `Recovery Codes` to the user and validate the OTP (One-time password).

All the examples below will be using Lucid as database store, and Adonis Auth as a way to retrieve the authenticated user. If that is not your case, you can use the examples as a guide to make it in your own situation.

## Creating a user Secret

The very first step is to create a `Secret` to user.

The `Secret` is an object containing a 32-character `secret` (keep user specific), a `uri` (if you want to make your own QR / barcode) and a `direct link` to a QR code served via HTTPS by the Google Chart API.

To create that we should call the `generateSecret` method passing some user information, like an `email` or `username`, that will also show up in the user's authenticator app.

```ts
import type { HttpContext } from '@adonisjs/core/http'

import twoFactorAuth from '@mdsadique-inam/adonisjs-2fa/services/main'

export default class TwoFactorAuthController {
  async generate({ auth }: HttpContext) {
    const user = auth.user!

    // highlight-start
    const twoFactorSecret = twoFactorAuth.generateSecret(user.email)
    // highlight-end
    /*
    {
      secret: 'MIQG4XQWEBSRATZIGBOXOQLBAARGM6KP',
      uri: 'otpauth://totp/My%20app:johndoe%40test.com?secret=MIQG4XQWEBSRATZIGBOXOQLBAARGM6KP&period=30&digits=6&algorithm=SHA1&issuer=My%20app',
      qr: 'data:image/png;base64,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'
    }
    */
    user.twoFactorSecret = twoFactorSecret.secret
    await user.save()

    return twoFactorSecret
  }
}
```

As a good practice, you should store that object encrypted in the database. You can use the Adonis [encryption](https://docs.adonisjs.com/guides/encryption) service to encrypt and decrypt.

If you are using [Lucid](https://lucid.adonisjs.com/docs/introduction), you can automate this process in your `User` model for example:

```ts
// ...other imports
import encryption from '@adonisjs/core/services/encryption'

export default class User extends compose(BaseModel, AuthFinder) {
  // ...other user columns

  // highlight-start
  @column({
    consume: (value: string) => (value ? encryption.decrypt(value) : null),
    prepare: (value: string) => encryption.encrypt(value),
  })
  declare twoFactorSecret: string | null
  // highlight-end
}
```

## Generate Recovery Codes

If you don't know what is a recovery code, or why are they important, please read this [article](https://support.authy.com/hc/en-us/articles/1260803525789-What-is-a-Recovery-or-Backup-Code). Simply put, in case that your user lost their authenticator app, they can user the recovery code to access your project and maybe create another `Secret`.

To create them we should call the `generateRecoveryCodes` method. As default, it will create 16 codes. If you want to change that, you can pass the `number` as an argument of the method.

```ts
import type { HttpContext } from '@adonisjs/core/http'

import twoFactorAuth from '@mdsadique-inam/adonisjs-2fa/services/main'

export default class TwoFactorAuthController {
  async generateRecoveryCodes({ auth }: HttpContext) {
    const user = auth.user!

    // highlight-start
    user.twoFactorRecoveryCodes = twoFactorAuth.generateRecoveryCodes() // or .generateRecoveryCodes(32)
    // highlight-end
    // ['XMCIM 5WAGK', 'MYM50 GHZJW', 'YWCHF 0TWRE', ...]

    await user.save()

    return { recovery_codes: user.twoFactorRecoveryCodes }
  }
}
```

You should store that array encrypted as well in the database just like the `Secret`. `User` model example:

```ts
// ...other imports
import encryption from '@adonisjs/core/services/encryption'

export default class User extends compose(BaseModel, AuthFinder) {
  // ...other user columns

  // highlight-start
  @column({
    consume: (value: string) => (value ? encryption.decrypt(value) : []),
    prepare: (value: string[]) => encryption.encrypt(value),
  })
  declare twoFactorRecoveryCodes: string[]
  // highlight-end
}
```

## Verify OTP

To verify the OTP (One-time password) we should use the `verifyToken` method passing the user `32-character secret`, the `otp` string that he is trying to verify and his array of `recovery codes`.

```ts
import type { HttpContext } from '@adonisjs/core/http'

import twoFactorAuth from '@mdsadique-inam/adonisjs-2fa/services/main'

export default class TwoFactorAuthController {
  async verify({ auth, request, response }: HttpContext) {
    const otp = await request.input('otp')

    const user = auth.user!

    // highlight-start
    const isValid = twoFactorAuth.verifyToken(
      user.twoFactorSecret,
      otp,
      user.twoFactorRecoveryCodes
    )
    // highlight-end

    if (!isValid) {
      return response.badRequest({ message: 'OTP invalid' })
    }

    return response.ok({ message: 'OTP valid' })
  }
}
```

This method will try to verify if the `otp` is valid to the user `secret`, or if the `recovery codes` includes the otp.
