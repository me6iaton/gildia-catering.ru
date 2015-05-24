(($) ->
  $ ->
    console.log("DOM is ready")
    $('#serviceTabs a:first').tab('show')
    timer = null
    $('#serviceTabs .tab').hover ->
      clearTimeout(timer) if timer
      timer = setTimeout( () =>
        $(this).tab 'show'
      , 200)
    $('#serviceSlider .icon-right').click ->
      $next = $('#serviceTabs .active').next().find('a')
      $next = $('#serviceTabs a:first') if (!$next.length)
      $next.tab 'show'
    $('#serviceSlider .icon-left').click ->
      $next = $('#serviceTabs .active').prev().find('a')
      $next = $('#serviceTabs a:last') if (!$next.length)
      $next.tab 'show'

) jQuery
