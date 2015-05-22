(($) ->
  $ ->
    console.log("DOM is ready")
    $('#tabService a:first').tab('show')

#    $('#tabService .tab').hover ->
#        $(this).tab 'show'

    $('#tabService > li').mouseover ->
      $(this).find('a').tab 'show'
    $('#tabService > li').mouseout ->
      $(this).find('a').tab 'hide'
) jQuery
