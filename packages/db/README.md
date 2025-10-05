# Before you begin
In setting everything up, you will need to regularly swap between the `packages/db` and `apps/app` directories. This is because the database configuration is in the `packages/db` package, but the commands to apply migrations and interact with the database are in the `apps/app` package.

Any time you see a `wrangler` command, it should be run from the `apps/app` package, as that is where the `wrangler.jsonc` file is located. The `wrangler.jsonc` file contains the configuration for the D1 database and is used by Wrangler to apply migrations and interact with the database.

# Understanding the configuration
This is the configuration for Drizzle which is used to connect to the database. This is used in the `apps/app` and can be used in other Cloudflare Workers based services like `Agents`.

It is important to understand that any migrations you run will be done from this package, however, any commands to interact with the database (such as applying migrations) should be done from the `apps/app` package (or any other package which has a `wrangler.jsonc` file).

# Setup and development flow
## Create a D1 database
Follow the steps in the [Cloudflare documentation](https://developers.cloudflare.com/d1/get-started/#2-create-a-database) to create a D1 database.

You can either do it using the Cloudflare Dashboard, or by using the Wrangler CLI. This guide uses the Wrangler CLI, which is the recommended way to create and manage D1 databases.

> If you wish to use the Wrangler CLI, you must do it from a `Workers` directory and **not** this package. `Workers` directories are the only ones that can run `wrangler` commands.

## Local, Staging, and Production databases
You can use the same D1 database for local, staging, and production environments. However, it is recommended to use different databases for each environment to avoid any accidental data loss or corruption.

You can run the Wrangler CLI command three times to create three different databases. After successfully creating each database, the Wrangler CLI will output the database ID, which you can use in your `wrangler.jsonc` file.

```bash
wrangler d1 create next-cloudflare-turbo-local
```
```bash
wrangler d1 create next-cloudflare-turbo-staging
```
```bash
wrangler d1 create next-cloudflare-turbo
```

After running these three commands, your `wrangler.jsonc` should now look like this:

```json
{
  // DEFAULT: Local development database
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "next-cloudflare-turbo-local",
      "database_id": "YOUR_LOCAL_DATABASE_ID_HERE",
      "migrations_dir": "../../packages/db/drizzle/migrations"
    }
  ],
  
  // ENVIRONMENTS: Different databases for different environments
  "env": {
    "production": {
      "d1_databases": [
        {
          "binding": "DB",
          "database_name": "next-cloudflare-turbo",
          "database_id": "04bb2f8f-076a-4e72-8baf-c4b533ad3ef8",
          "migrations_dir": "../../packages/db/drizzle/migrations"
        }
      ]
    },
    "staging": {
      "d1_databases": [
        {
          "binding": "DB", 
          "database_name": "next-cloudflare-turbo-staging",
          "database_id": "YOUR_STAGING_DATABASE_ID_HERE",
          "migrations_dir": "../../packages/db/drizzle/migrations"
        }
      ]
    }
  }
}
```

> **Note:** The `binding` is the name you will use to access the database in your code. In this case, it is `DB`. You can change this to whatever you like, but it must match the binding in your `wrangler.jsonc` file. It is the same for all three, as we will always access it in our code like `env.DB`.

## Defining schemas and running migrations
For full information on migrations, and the various commands available, refer to the [Drizzle documentation](https://orm.drizzle.team/docs/kit-overview).

From the [migrations](https://orm.drizzle.team/docs/migrations) documentation we are running Drizzle using the example given of "Option 4": 

> "*I want to have database schema in my TypeScript codebase, I want Drizzle to generate SQL migration files for me and I want Drizzle to apply them during runtime.*" 
> 
> That’s a codebase first approach. You have your TypeScript Drizzle schema as a source of truth and Drizzle let’s you generate SQL migration files based on your schema changes with drizzle-kit generate and then you can apply them to the database during runtime of your application.
>
> This approach is widely used for monolithic applications when you apply database migrations during zero downtime deployment and rollback DDL changes if something fails. This is also used in serverless deployments with migrations running in custom resource once during deployment process.

Under-the-hood, this looks like the below:
```md
┌────────────────────────┐                  
│ $ drizzle-kit generate │                  
└─┬──────────────────────┘                  
  │                                           
  └ 1. read previous migration folders
    2. find diff between current and previous schema
    3. prompt developer for renames if necessary
  ┌ 4. generate SQL migration and persist to file
  │    ┌─┴───────────────────────────────────────┐  
  │      📂 drizzle       
  │      └ 📂 20242409125510_premium_mister_fear
  │        ├ 📜 snapshot.json
  │        └ 📜 migration.sql
  v
```

## Generating migrations
When you are ready to run migrations, from this package, run the following command:

```bash
npm run db:generate
```

This will generate a new migration file in the `drizzle` directory. The file will be named with a timestamp and a description of the migration, e.g., `20242409125510_premium_mister_fear`.

## Applying migrations
To apply the migrations, you must now move to another terminal in a Worker directory which has `wrangler.jsonc`. In this repository, this is the `apps/app` package.

From that package, this is done by running the following command:

```bash
wrangler d1 migrations apply <DATABASE_NAME> [OPTIONS]
```

For more information, see the Cloudflare Wrangler documentation on [D1 migrations](https://developers.cloudflare.com/workers/wrangler/commands/#d1-migrations-apply).

> **Note:** In order for this to work, you must tell Wrangler where the migration files are, otherwise it will default to the cwd. The `wrangler.jsonc` file in the `apps/app` package has been configured to point to the `drizzle/migrations` directory in this package: 
>  
> ```json
>    "d1_databases": [
>      {
>        "binding": "DB",
>        "database_name": "next-cloudflare-turbo",
>        "database_id": "04bb2f8f-076a-4e72-8baf-c4b533ad3ef8",
>        "migrations_dir": "../../packages/db/drizzle/migrations"
>      }
>    ]
> 
> ```

To validate the migrations, you can run the following command from the `apps/app` package:

```bash
npm run db:validate:local
```

This is not a script you'll need to run often, but it is useful when setting up to confirm that the migrations have been applied correctly. It will return a list of tables in the database, which you can compare against your expected schema. A successful output will look like this:

```bash
🌀 Executing on local database next-cloudflare-turbo (04bb2f8f-076a-4e72-8baf-c4b533ad3ef8) from .wrangler\state\v3\d1:
🌀 To execute on your remote database, add a --remote flag to your wrangler command.
🚣 1 command executed successfully.
┌─────────────────┐
│ name            │
├─────────────────┤
│ d1_migrations   │
├─────────────────┤
│ sqlite_sequence │
├─────────────────┤
│ _cf_METADATA    │
├─────────────────┤
│ posts           │
├─────────────────┤
│ users           │
└─────────────────┘
```