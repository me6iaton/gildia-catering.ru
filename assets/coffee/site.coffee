(($) ->
  $ ->
#   hyphenate
    $('.hypher').hyphenate('ru')

#region   menu
#    $('.dropdown-full').hover(->
#      if (!$(@).hasClass('open'))
#        $(@).find('.dropdown-toggle').dropdown('toggle')
#    ,->
#      if ($(@).hasClass('open'))
#        $(@).find('.dropdown-toggle').dropdown('toggle')
#    )

    $navbarMain = $('#navbar-main')
    $navbarMainBtn = $('#navbar-main-btn')
    $flagDocWidthXs = $(window).width() > 768
    $flagNavbarMainScroll = $(window).scrollTop() > $('#navbar-main-trigger').offset().top
    $('#navbar-main-trigger').affix({
      offset: {
        top: ()->
          if $flagDocWidthXs
            $('#navbar-main-trigger').offset().top
          else
            10000000000
      }
    }).on('affix.bs.affix', ()->
      $navbarMain.addClass('collapse affix')
      $navbarMainBtn.show()
    ).on('affix-top.bs.affix', ()->
      $navbarMainBtn.hide()
      $navbarMain.removeClass('collapse affix')
    )
    if $flagNavbarMainScroll  and $flagDocWidthXs
      $navbarMain.addClass('collapse affix')
      $navbarMainBtn.show()

    uri = new URI()
    uriSegmentFirst = uri.segment(0)
    $('#navbar-main-collapse ul li a').each(()->
      $this = $(this)
      if $this.attr('href') and new URI($this.attr('href')).segment(0) == uriSegmentFirst
        $this.parent().addClass('active')
    )
    $('.nav-btns-active a').each ()->
      $this = $(this)
      if $this.attr('href') and new URI($this.attr('href')).segment(0) == uriSegmentFirst
        $this.addClass('selected')
    if uriSegmentFirst == "articles"
      $('#navbar-main-collapse ul li a[href="/news/"]').parent().addClass('active')
    console.log(uriSegmentFirst)
#endregion

#region   main slider
    if ($('#swiperIndex')[0])
      TimerInterval = (callback, delay) ->
        timerId = undefined
        remaining = delay
        @pause = ->
          clearTimeout timerId
        @resume = ->
          clearTimeout timerId
          timerId = setInterval(callback, remaining)
        @resume()

      swiperIndex = new Swiper('#swiperIndex', {
        loop: true
        nextButton:  '#swiperIndex .icon-right'
        prevButton: '#swiperIndex .icon-left'
        slidesPerView: 1
        effect: 'fade'
        speed: 1000
        paginationClickable: true
      })

      sliderTimer = new TimerInterval ()->
        swiperIndex.update(true)
        swiperIndex.slideNext()
      , $('#swiperIndex').data('sliderTimeout')

      sliderTimerAutoplay = null
      $('#serviceTabs .tab, #swiperIndex').hover(
        ->
          clearTimeout(sliderTimerAutoplay) if sliderTimerAutoplay
          sliderTimerAutoplay = setTimeout () ->
            sliderTimer.pause()
  #          console.log('end')
          , 100
        ,->
          sliderTimerAutoplay = setTimeout () ->
            sliderTimer.resume()
  #          console.log('start')
          , 100
      )

      $('#serviceTabs .tab').eq(0).addClass 'hover'
      swiperIndex.on 'slideChangeStart',  ()->
        index = swiperIndex.activeIndex - 1
        index = 0 if(index == 8)
  #      console.log(index)
        $('#serviceTabs .tab').removeClass 'hover'
        $('#serviceTabs .tab').eq(index).addClass 'hover'

      sliderTimerHover = null
      $('#serviceTabs .tab').hover ->
        clearTimeout(sliderTimerHover) if sliderTimerHover
        sliderTimerHover = setTimeout( () =>
          swiperIndex.slideTo( $(@).index() + 1)
        , $('#swiperIndex').data('sliderTimeoutHover'))

#endregion

#region   why us
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
#endregion

#region   lightbox form
    $.fn.serializeObject = ->
      o = {}
      a = @serializeArray()
      $.each a, ->
        if o[@name] != undefined
          if !o[@name].push
            o[@name] = [ o[@name] ]
          o[@name].push @value or ''
        else
          o[@name] = @value or ''
        return
      o
    magnificPopup = $.magnificPopup.instance
    $('.btn-popup').magnificPopup
      type: 'inline'
      preloader: false
      focus: '#inputName'
      removalDelay: 500
      mainClass: 'mfp-move-from-top'
    $('#inputDate').datepicker(
      language: 'ru'
      orientation: 'bottom'
    )
    $popupForm = $('.popup-form')
    $popupForm.validator().on 'submit', (e) ->
      if e.isDefaultPrevented()
        console.log('validation fail')
      else
        e.preventDefault()
        $target = $(e.target)
        formDataArr = $target.serializeArray()
        formMessage = '<table cellspacing="0" cellpadding="10" border="0" width="100%"><tbody>'
        formDataArr.forEach (element) ->
          formMessage = formMessage.concat "<tr>
              <td align='right' valign='top' style='padding:5px 5px 5px 0;' width='200'> <strong> #{element.name}:</strong> </td>
              <td align='left' valign='top' style='padding:5px 5px 5px 0;' width='*'> #{element.value}</td>
            </tr> " if element.name != '_subject'
        formMessage = formMessage.concat '</tbody></table>'
        formData = $target.serializeObject()
        formData['email'] ?= 'info@gildia-catering.ru'
        $.ajax
          type: 'POST'
          url: 'https://mandrillapp.com/api/1.0/messages/send.json'
          data:
            key: 'EKZL8t3uhKvqmT5Gx3rz_w'
            message:
              from_email: formData['email']
              from_name: formData['Ваше имя']
              headers:
                'Reply-To': formData['email']
              html: formMessage
              subject: formData['_subject']
              to: [
                email: 'info@gildia-catering.ru'
              ]
          success: (data) ->
            $('#popup-alert-success').magnificPopup(items:
              src: '#popup-alert-success'
              type: 'inline').magnificPopup 'open'
            setTimeout(()->
              e.target.reset()
              magnificPopup.close()
            , 700)
          error: (xhr, str) ->
            console.error(xhr)
            console.error(str)
            alert('Возникла ошибка: ' + xhr.responseCode)
#endregion

#region   #btn scroll top
    $('#btn-top').affix
      offset:
        top: 500
        bottom: 200
    $('#btn-top').on 'click', (e)->
      e.preventDefault()
      $('body,html').animate
          scrollTop: 0
        , 700
#endregion

#region   lightbox images gallery
    lightboxImages = (slector) ->
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
#endregion

#region   gphoto images grid
    $.fn.gphoto.provider['ggrid'] =
      filter: (imageUrl, image) ->
        imageUrl: imageUrl
        data: image
      insert: ($link, images) ->
        $ggrid = $('<div class="ggrid"></div>')
        options = data: images
        if $link.attr("title")?
          options['template'] =  $link.attr("title")
        $link.replaceWith($ggrid)
        $ggrid.ggrid $.extend options, @
        lightboxImages(".ggrid") if @.lightbox

    $('a.gphoto-ggrid-lightbox').gphoto(
      provider: 'ggrid'
      columns: 3
      maxWidth: 1170
      padding: 5
      lightbox: true
    )

    $('a.gphoto-ggrid-about').gphoto(
      provider: 'ggrid'
      columns: 2
      maxWidth: 800
      padding: 5
      template: '1-2-2'
      lightbox: true
    )
#endregion

#region gphoto gallery
    $.fn.gphoto.provider['swiper'] =
      filter: (imageUrl, image)->
        image: "#{imageUrl}/#{@.imageSize}/"
        thumb: "#{imageUrl}/#{@.thumbSize}/"
      insert: ($link, images)->
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
        btnCntrSelector = $link.data("buttonContainer")
        new Swiper($swiper, jQuery.extend(@.swiper, {
          nextButton: "#{btnCntrSelector} .swiper-button-next"
          prevButton: "#{btnCntrSelector} .swiper-button-prev"
        }))
        lightboxImages(".#{@.containerClass}")

    $('a.swiper-link-gallery').gphoto(
      provider: 'swiper'
      imageSize: 'w1600'
      thumbSize: 'w300-h300-c'
      containerClass: 'swiper-gallery'
      swiper:
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

    $('a.swiper-link-artists').gphoto(
      provider: 'swiper'
      imageSize: 'w1600'
      thumbSize: 'w150-h150-c'
      containerClass: 'swiper-artists'
      swiper:
        loop: true
        nextButton:  '#swiperCarouselBtn .swiper-button-next'
        prevButton: '#swiperCarouselBtn .swiper-button-prev'
        slidesPerView: 3
        slidesPerGroup: 3
        paginationClickable: true
        spaceBetween: 10
    )
    $('#accordion a').one 'click', ()->
      $(@).closest('.panel').find('.swiper-container').each ()->
        setTimeout ()=>
          @.swiper.update(true)
        , 100
    $('#accordion .fa-angle-left').on 'click', (e)->
      $(@).parent().parent().find('.swiper-container')[0].swiper.slidePrev()
    $('#accordion .fa-angle-right').on 'click', (e)->
      $(@).parent().parent().find('.swiper-container')[0].swiper.slideNext()
#    $('#accordion .panel-heading').on 'click', (e)->
#      console.log($(@).find('a'))
##      $(@).find('a').triggerHandler('click')
#endregion

#region   Clients carousel
    swiperCarousel = new Swiper('.swiper-carousel', {
      loop: true
      nextButton:  '#btnClients .swiper-button-next'
      prevButton: '#btnClients .swiper-button-prev'
      slidesPerView: 4
      slidesPerGroup: 4
      paginationClickable: true
      spaceBetween: 20
    })
#endregion

#region   food tabs
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
#endregion

  )
) jQuery
