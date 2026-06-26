# API routes design guide

All API routes follow the same structure:

```json
{
    ...: any
},
{
    status: Int
}
```

For any routes that have a creation, modification, or deletion route, a ``success`` field will be included with the return:

```json
{
    success: bool,
    err?: string, // if success=false
    ...
}
```

The following API Status codes are used:

|Code|Definition|
|---|---|
|200|Success|
|201|Successfully created|
|400|Bad request (mostly for missing required fields)|
|500|Server error|
|401|Unauthorized, please pass a session token|
|403|Forbidden, your account can't access that|

API routes either need a ``__Secure-better-auth.session_token`` cookie or ``x-api-key`` in the header. Please check ``/api/docs`` for the full spec.

Quacky follows the following design principles when creating API routes:

```
Generally, the process in a route is:

Authenticate the user
↓
Get param headers (if applicable)
↓
Run the prisma query from @/server/prisma
↓
Check if the entry exists/If the user has access
↓
Add/Modify/Delete field (if applicable)
↓
Return field result
↓
Log to Upstream
```