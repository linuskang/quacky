# v3.0 schema

**This is the design guide for Quacky's API endpoints with versions ``≥ v0.3``.**

Generally, each endpoint under ``/api/*`` follows this structure, where they each consist of:

```json
{
    code: Int
    success: Boolean
    message?: String
    data?: Unknown
}
```

For all requests that fail, the ``message`` field is added with the error message. Other requests without errors may or may not include the message field.

Typically, any request which fetches data, creates a db field, patches, or deletes something will include the ``data`` field, which includes all the request data that you can integrate into your app.

The following codes are used:

|Code|Definition|
|---|---|
|200|Success|
|201|Successfully created|
|400|Bad request|
|500|Server error|
|401|Unauthorized|
|403|Forbidden|

For programatic use of the Quacky APIs, please create an API token and parse it using the ``x-api-key`` header. Otherwise, all internal app endpoints are either accessed through server components, or session tokens.


Generally, the flow in all Quacky API endpoints is to:
```
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
Log to Upstream (if applicable, for moderation)
```

For an example design with an custom API endpoint, check ``/api/example-endpoint`` for the design spec.

### Legacy v1/v2.0 endpoints

> [!NOTE]
> This api schema has been deprecated in newer versions starting from v0.3
> Please refer to above for the current schema.

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

Any routes that have a patch, delete, or post, will include the updated query from prisma as ``res``.