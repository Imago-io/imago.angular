class HttpInterceptor extends Factory

  constructor: ($q, $log, $injector) ->

    return {

      # request: (config) ->
      #   console.log 'config', config
      #   return config

      requestError: (rejection) ->
        $log.error angular.toJson rejection
        return $q.reject rejection

      responseError: (rejection) ->
        $state = $injector.get '$state'
        console.log 'rejection.status', rejection.status
        switch rejection.status
          when 401 then $state.go 'home'
          when 404 then $state.go 'page-not-found'
    }
