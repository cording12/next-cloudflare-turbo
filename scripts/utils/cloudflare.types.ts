export interface D1Database {
  binding: string
  database_name: string
  database_id: string
  migrations_dir: string
}

export interface R2Bucket {
  binding: string
  bucket_name: string
}

export interface ServiceBinding {
  binding: string
  service: string
}

export interface DurableObjectBinding {
  name: string
  class_name: string
}

export interface WranglerEnvironment {
  name?: string
  routes?: Array<{
    pattern: string
    custom_domain: boolean
  }>
  d1_databases?: D1Database[]
  r2_buckets?: R2Bucket[]
  services?: ServiceBinding[]
  durable_objects?: {
    bindings: DurableObjectBinding[]
  }
}

export interface WranglerConfig {
  name: string
  main: string
  compatibility_date: string
  compatibility_flags: string[]
  d1_databases?: D1Database[]
  r2_buckets?: R2Bucket[]
  assets?: {
    binding: string
    directory: string
  }
  observability?: {
    enabled: boolean
  }
  services?: ServiceBinding[]
  migrations?: Array<{
    tag: string
    new_sqlite_classes: string[]
  }>
  env?: {
    [key: string]: WranglerEnvironment
  }
}