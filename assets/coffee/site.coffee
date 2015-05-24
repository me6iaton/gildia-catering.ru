(($) ->
  $ ->
    console.log("DOM is ready")
    $('#serviceTabs a:first').tab('show')
    timer = null
    $('#serviceTabs .tab').hover ->
      clearTimeout(timer) if timer
      timer = setTimeout( () =>
        $(@).tab 'show'
      , 200)

    $('#serviceSlider .icon-right').click ->
      $next = $('#serviceTabs .active').next().find('a')
      $next = $('#serviceTabs a:first') if (!$next.length)
      $next.tab 'show'
    $('#serviceSlider .icon-left').click ->
      $next = $('#serviceTabs .active').prev().find('a')
      $next = $('#serviceTabs a:last') if (!$next.length)
      $next.tab 'show'

    transform = (a, b) ->
      # set the stage so ramjet copies the right styles...
      b.classList.remove 'hidden'

      ramjet.transform a, b, done: ->
        # this function is called as soon as the transition completes
        b.classList.remove 'hidden'

      # ...then hide the original elements for the duration of the transition
      a.classList.add 'hidden'
      b.classList.add 'hidden'

    $('.whyus-intro').click -> transform(@, @.nextSibling)
    $('.whyus-detail').click -> transform(@, @.previousSibling)

    $('.hypher').hyphenate('ru')


) jQuery
