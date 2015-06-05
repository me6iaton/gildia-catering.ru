(($) ->
  $ ->
#   menu
    $('.dropdown-full').hover(->
      if (!$(@).hasClass('open'))
        $(@).find('.dropdown-toggle').dropdown('toggle')
    ,->
      if ($(@).hasClass('open'))
        $(@).find('.dropdown-toggle').dropdown('toggle')
    )

#   hyphenate
    $('.hypher').hyphenate('ru')

#   slider
    TimerInterval = (callback, delay) ->
      timerId = undefined
      remaining = delay
      @pause = ->
        clearTimeout timerId
      @resume = ->
        clearTimeout timerId
        timerId = setInterval(callback, remaining)
      @resume()

    $('#serviceTabs a:first').tab('show')

#    sliderTimer = new TimerInterval((->
#      $('#serviceSlider .icon-right').click()
#    ), $('#serviceSlider').data('sliderTimeout'))

    sliderTimerHover = null
    $('#serviceTabs .tab').hover ->
      clearTimeout(sliderTimerHover) if sliderTimerHover
      sliderTimerHover = setTimeout( () =>
        $(@).tab 'show'
      , $('#serviceSlider').data('sliderTimeoutHover'))

#    $('#serviceTabs .tab, #serviceSlider').hover(
#      ->
#        sliderTimer.pause()
#      ,->
#        sliderTimer.resume()
#    )
    $('#serviceSlider .icon-right').click ->
      $next = $('#serviceTabs .active').next().find('a')
      $next = $('#serviceTabs a:first') if (!$next.length)
      $next.tab 'show'
    $('#serviceSlider .icon-left').click ->
      $next = $('#serviceTabs .active').prev().find('a')
      $next = $('#serviceTabs a:last') if (!$next.length)
      $next.tab 'show'


#   why us
    transform = (a, b) ->
      # set the stage so ramjet copies the right styles...
      b.classList.remove 'hidden'
      ramjet.transform a, b, done: ->
        # this function is called as soon as the transition completes
        b.classList.remove 'hidden'
        if($(a).hasClass('whyus-intro'))
          $('.whyus').css('min-height', $(b).find('.row').innerHeight() + 20)
        else
          $('.whyus').css('min-height', '')
      # ...then hide the original elements for the duration of the transition
      a.classList.add 'hidden'
      b.classList.add 'hidden'

    $('.whyus-intro').click -> transform(@, @.nextSibling)
    $('.whyus-detail').click -> transform(@, @.previousSibling)

#   lightbox
    lightbox = (slector) ->
      $(slector).magnificPopup
        delegate: 'a'
        type: 'image'
        closeOnContentClick: false
        closeBtnInside: false
        mainClass: 'mfp-with-zoom mfp-img-mobile'
        image:
          verticalFit: true
        gallery: enabled: true
        zoom:
          enabled: true
          duration: 300
          opener: (element) ->
            element.find 'img'

#   gallery
    $.fn.gphoto.provider['swiper'] =
      filter: (imageUrl, image)->
        image: "#{imageUrl}/#{@.imageSize}/"
        thumb: "#{imageUrl}/#{@.thumbSize}/"
      insert: ($link, images)->
        console.log(@)
        $swiper = $('<div class="swiper-container"></div>')
        $swiperWrapper = $('<div class="swiper-wrapper"></div>')
        $.each(images, (index, element)->
          $swiperWrapper.append(
            """
            <div class="swiper-slide">
               <a href="#{element.image}" data-effect="mfp-zoom-in">
                  <img src="#{element.thumb}" class="img-responsive"/>
                </a>
            </div>
            """
          )
        )
        $swiper.append($swiperWrapper)
        $swiper.addClass(@.containerClass)
        $link.replaceWith($swiper)
        new Swiper($swiper, @.swiper)
        lightbox(".#{@.containerClass}")

    $('a.swiper-link-gallery').gphoto(
      provider: 'swiper'
      imageSize: 'w1600'
      thumbSize: 'w300-h300-c'
      containerClass: 'swiper-gallery'
      swiper:
        nextButton: '#swiperGalleryBtn .swiper-button-next'
        prevButton: '#swiperGalleryBtn .swiper-button-prev'
        paginationClickable: true
        effect: 'coverflow'
        grabCursor: true
        centeredSlides: false
        slidesPerView: 'auto'
        coverflow:
          rotate: 50
          stretch: 0
          depth: 100
          modifier: 1
          slideShadows: true
    )

    $('a.swiper-link-carousel').gphoto(
      provider: 'swiper'
      imageSize: 'w1600'
      thumbSize: 'w300-h200-c'
      containerClass: 'swiper-carousel'
      swiper:
        loop: true
        nextButton:  '#swiperCarouselBtn .swiper-button-next'
        prevButton: '#swiperCarouselBtn .swiper-button-prev'
        slidesPerView: 4
        slidesPerGroup: 4
        paginationClickable: true
        spaceBetween: 20
    )

    swiperCarousel = new Swiper('.swiper-carousel', {
      loop: true
      nextButton:  '#swiperCarouselBtn .swiper-button-next'
      prevButton: '#swiperCarouselBtn .swiper-button-prev'
      slidesPerView: 4
      slidesPerGroup: 4
      paginationClickable: true
      spaceBetween: 20
    })

#   food tabs
    $("#food .nav-btns-menu a").click((e)->
      e.preventDefault()
      $(@).parent().find('a').removeClass('selected')
      $(@).addClass('selected')
      $(this).tab('show')
    )
    $('#food .nav-btns-person a').click((e)->
      e.preventDefault()
      $(@).closest('.tab-pane').find('.nav-btns-person a').removeClass('selected')
      $(@).addClass('selected')
      $(@).closest('.tab-pane').find('.nav-btns-person a[href="'+$(@).attr('href')+'"]').addClass('selected')
      $(this).tab('show')
    )
    $('#food .nav-btns-person:hidden a:nth-child(1)').click()
    $('#food .nav-btns-menu a:first').click()

    $('#food .table').each(()->
      $('tr.td').filter(':odd').addClass('even')

  )
) jQuery
