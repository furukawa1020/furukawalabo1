module Api
  module V1
    module Admin
      class BaseController < ApplicationController
        # Basic Auth
        http_basic_authenticate_with name: "furukawa1020", password: "k1o0t2a0ro"

        # Skip verify_authenticity_token if strictly API mode, 
        # but ApplicationController might already be ActionController::API
        # Just to be safe for file uploads etc.
        skip_before_action :verify_authenticity_token, raise: false
      end
    end
  end
end
