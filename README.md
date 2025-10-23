```
chatover-flow-admin
├─ api
│  ├─ .env
│  ├─ .env.example
│  ├─ .prettierrc
│  ├─ dist
│  ├─ eslint.config.mjs
│  ├─ nest-cli.json
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ pnpm-lock.yaml
│  ├─ README.md
│  ├─ src
│  │  ├─ app.controller.spec.ts
│  │  ├─ app.controller.ts
│  │  ├─ app.module.ts
│  │  ├─ app.service.ts
│  │  ├─ common
│  │  │  ├─ decorators
│  │  │  ├─ dto
│  │  │  │  ├─ api-response.dto.ts
│  │  │  ├─ exceptions
│  │  │  └─ utils
│  │  │     ├─ jwt.util.ts
│  │  │     ├─ otp.util.ts
│  │  │     ├─ ...
│  │  ├─ database
│  │  │  ├─ entities
│  │  │  ├─ migrations
│  │  │  └─ seeders
│  │  ├─ features
│  │  │  ├─ auth
│  │  │  │  ├─ auth.controller.ts
│  │  │  │  ├─ auth.module.ts
│  │  │  │  ├─ auth.repository.ts
│  │  │  │  ├─ decorators
│  │  │  │  │  └─ user-id.decorator.ts
│  │  │  │  ├─ dto
│  │  │  │  │  ├─ forgot-password.dto.ts
│  │  │  │  │  ├─ login.dto.ts
│  │  │  │  │  └─ ...
│  │  │  │  ├─ entities
│  │  │  │  │  ├─ user-password-reset.entity.ts
│  │  │  │  │  └─ user.entity.ts
│  │  │  │  ├─ guards
│  │  │  │  │  └─ jwt-auth.guard.ts
│  │  │  │  └─ services
│  │  │  │     ├─ login.service.ts
│  │  │  │     ├─ ...
│  │  │  └─ dashboard
│  │  │     ├─ dashboard.controller.ts
│  │  │     ├─ dashboard.module.ts
│  │  │     └─ dashboard.service.ts
│  │  └─ main.ts
│  ├─ test
│  ├─ tsconfig.build.json
│  └─ tsconfig.json
```
