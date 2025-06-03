terraform {
  required_providers {
    render = {
      source = "render-oss/render"
      version = "1.7.0"
    }
  }
}

provider "render" {

  ## WARNING! do not commit your Render API Key!
  api_key = "" # can also be set with RENDER_API_KEY envvar
  owner_id = ""
}

resource "render_project" "patient-api" {
  name = "patient-api"
  environments = {
    "development" : {
      name : "development",
      protected_status : "unprotected"
    }
  }
}

resource "render_postgres" "patient_database" {
  name    = "patient_database"
  plan    = "basic_256mb"
  region  = "ohio"
  version = "16"
}



resource "render_web_service" "patient-api" {
  name               = "patient-api"
  plan               = "starter"
  region             = "ohio"

  env_vars = {
    DATABASE_URL = {
      value = render_postgres.patient_database.connection_info.internal_connection_string
    }
  }

  runtime_source = {
    docker = {
      branch = "main"
      repo_url = "https://github.com/render-examples/patient-api"
    }
  }
}