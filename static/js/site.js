(function($) {
  $.fn.extend({
    gphoto: function(options) {
      var provider, settings;
      settings = {
        provider: 'fotorama'
      };
      settings = $.extend(settings, options);
      provider = $.fn.gphoto.provider;
      return this.filter("[href ^= https\\:\\/\\/plus\\.google\\.com\\/photos]").each(function() {
        var $link, albumId, url, userId;
        $link = $(this);
        url = new URI($link.attr('href'));
        userId = url.segment(1);
        albumId = url.segment(3);
        return $.getJSON("https://picasaweb.google.com/data/feed/api/user/" + userId + "/albumid/" + albumId + "?kind=photo&access=public&alt=json-in-script&callback=?", function(data, status) {
          var images;
          images = data.feed.entry.map(function(image) {
            var imageUrl;
            url = new URI(image.content.src);
            imageUrl = (url.protocol()) + "://" + (url.host()) + (url.directory());
            return provider[settings.provider].filter.call(settings, imageUrl, image);
          });
          provider[settings.provider].insert.call(settings, $link, images);
        });
      });
    }
  });
  return $.fn.gphoto.provider = {
    fotorama: {
      filter: function(imageUrl, image) {
        return {
          img: imageUrl + "w0/",
          thumb: imageUrl + "w64-h64/"
        };
      },
      insert: function($link, images) {
        var $fotorama;
        $fotorama = $('<div class="fotorama"></div>');
        $link.replaceWith($fotorama);
        $fotorama.fotorama($.extend({
          data: images
        }, this));
      }
    },
    ggrid: {
      filter: function(imageUrl, image) {
        return {
          imageUrl: imageUrl,
          data: image
        };
      },
      insert: function($link, images) {
        var $ggrid, options;
        $ggrid = $('<div class="ggrid"></div>');
        options = {
          data: images
        };
        if ($link.attr("title") != null) {
          options['template'] = $link.attr("title");
        }
        $link.replaceWith($ggrid);
        $ggrid.ggrid($.extend(options, this));
        $ggrid.find('a').fluidbox();
      }
    }
  };
})(jQuery);

(function($) {
  return $.fn.extend({
    ggrid: function(options) {
      var $this, chunk, i, images, iter, methods, settings, template;
      $this = this;
      settings = {
        columns: 4,
        maxWidth: 1170,
        padding: 5
      };
      settings = $.extend(settings, options);
      methods = {
        makeRow: function(images) {
          var $out, constanta, image, j, len, maxWidth, width;
          $out = $("<div data-paragraph-count='" + images.length + "' class='row'></div>");
          constanta = 1 / images.reduceRight(function(one, two) {
            if (images.length !== 1) {
              return (one.data ? 1 / (Number(one.data.gphoto$height.$t) / Number(one.data.gphoto$width.$t)) : one) + 1 / (Number(two.data.gphoto$height.$t) / Number(two.data.gphoto$width.$t));
            }
          });
          for (j = 0, len = images.length; j < len; j++) {
            image = images[j];
            if (images.length !== 1) {
              width = constanta / (Number(image.data.gphoto$height.$t) / Number(image.data.gphoto$width.$t)) * 100;
              maxWidth = Math.round(settings.maxWidth / 100 * width);
            } else {
              width = 100;
              maxWidth = 0;
            }
            $out.append("<div class='col' style='width: " + width + "%;'>\n  <a href=\"" + image.imageUrl + "/w0/\">\n    <img class='img-responsive' src='" + image.imageUrl + "/w" + maxWidth + "/' alt='' />\n  </a>\n</div>");
          }
          $this.append($out);
        }
      };
      images = options.data;
      if (options.template != null) {
        template = options.template.split('-');
      }
      chunk;
      i = 0;
      iter = 0;
      while (i < images.length) {
        if (template != null ? template[iter] : void 0) {
          chunk = Number(template[iter]);
          iter++;
        } else {
          chunk = images.length - (i + settings.columns) === 1 ? settings.columns - 1 : settings.columns;
        }
        methods.makeRow(images.slice(i, i + chunk));
        i += chunk;
      }
      return this.each(function() {
        console.log('ggrid');
      });
    }
  });
})(jQuery);

(function($) {
  return $(function() {
    var $flagDocWidthXs, $flagNavbarMainScroll, $navbarMain, $navbarMainBtn, $popupForm, TimerInterval, lightboxImages, magnificPopup, sliderTimer, sliderTimerAutoplay, sliderTimerHover, swiperCarousel, swiperIndex, transform, uri, uriSegmentFirst;
    $('.hypher').hyphenate('ru');
    $navbarMain = $('#navbar-main');
    $navbarMainBtn = $('#navbar-main-btn');
    $flagDocWidthXs = $(window).width() > 768;
    $flagNavbarMainScroll = $(window).scrollTop() > $('#navbar-main-trigger').offset().top;
    $('#navbar-main-trigger').affix({
      offset: {
        top: function() {
          if ($flagDocWidthXs) {
            return $('#navbar-main-trigger').offset().top;
          } else {
            return 10000000000;
          }
        }
      }
    }).on('affix.bs.affix', function() {
      $navbarMain.addClass('collapse affix');
      return $navbarMainBtn.show();
    }).on('affix-top.bs.affix', function() {
      $navbarMainBtn.hide();
      return $navbarMain.removeClass('collapse affix');
    });
    if ($flagNavbarMainScroll && $flagDocWidthXs) {
      $navbarMain.addClass('collapse affix');
      $navbarMainBtn.show();
    }
    uri = new URI();
    uriSegmentFirst = uri.segment(0);
    $('#navbar-main-collapse ul li a').each(function() {
      var $this;
      $this = $(this);
      if ($this.attr('href') && new URI($this.attr('href')).segment(0) === uriSegmentFirst) {
        return $this.parent().addClass('active');
      }
    });
    $('.nav-btns-active a').each(function() {
      var $this;
      $this = $(this);
      if ($this.attr('href') && new URI($this.attr('href')).segment(0) === uriSegmentFirst) {
        return $this.addClass('selected');
      }
    });
    if (uriSegmentFirst === "articles") {
      $('#navbar-main-collapse ul li a[href="/news/"]').parent().addClass('active');
    }
    console.log(uriSegmentFirst);
    if (($('#swiperIndex')[0])) {
      TimerInterval = function(callback, delay) {
        var remaining, timerId;
        timerId = void 0;
        remaining = delay;
        this.pause = function() {
          return clearTimeout(timerId);
        };
        this.resume = function() {
          clearTimeout(timerId);
          return timerId = setInterval(callback, remaining);
        };
        return this.resume();
      };
      swiperIndex = new Swiper('#swiperIndex', {
        loop: true,
        nextButton: '#swiperIndex .icon-right',
        prevButton: '#swiperIndex .icon-left',
        slidesPerView: 1,
        effect: 'fade',
        speed: 1000,
        paginationClickable: true
      });
      sliderTimer = new TimerInterval(function() {
        swiperIndex.update(true);
        return swiperIndex.slideNext();
      }, $('#swiperIndex').data('sliderTimeout'));
      sliderTimerAutoplay = null;
      $('#serviceTabs .tab, #swiperIndex').hover(function() {
        if (sliderTimerAutoplay) {
          clearTimeout(sliderTimerAutoplay);
        }
        return sliderTimerAutoplay = setTimeout(function() {
          return sliderTimer.pause();
        }, 100);
      }, function() {
        return sliderTimerAutoplay = setTimeout(function() {
          return sliderTimer.resume();
        }, 100);
      });
      $('#serviceTabs .tab').eq(0).addClass('hover');
      swiperIndex.on('slideChangeStart', function() {
        var index;
        index = swiperIndex.activeIndex - 1;
        if (index === 8) {
          index = 0;
        }
        $('#serviceTabs .tab').removeClass('hover');
        return $('#serviceTabs .tab').eq(index).addClass('hover');
      });
      sliderTimerHover = null;
      $('#serviceTabs .tab').hover(function() {
        if (sliderTimerHover) {
          clearTimeout(sliderTimerHover);
        }
        return sliderTimerHover = setTimeout((function(_this) {
          return function() {
            return swiperIndex.slideTo($(_this).index() + 1);
          };
        })(this), $('#swiperIndex').data('sliderTimeoutHover'));
      });
    }
    transform = function(a, b) {
      b.classList.remove('hidden');
      ramjet.transform(a, b, {
        done: function() {
          b.classList.remove('hidden');
          if ($(a).hasClass('whyus-intro')) {
            return $('.whyus').css('min-height', $(b).find('.row').innerHeight() + 20);
          } else {
            return $('.whyus').css('min-height', '');
          }
        }
      });
      a.classList.add('hidden');
      return b.classList.add('hidden');
    };
    $('.whyus-intro').click(function() {
      return transform(this, this.nextSibling);
    });
    $('.whyus-detail').click(function() {
      return transform(this, this.previousSibling);
    });
    $.fn.serializeObject = function() {
      var a, o;
      o = {};
      a = this.serializeArray();
      $.each(a, function() {
        if (o[this.name] !== void 0) {
          if (!o[this.name].push) {
            o[this.name] = [o[this.name]];
          }
          o[this.name].push(this.value || '');
        } else {
          o[this.name] = this.value || '';
        }
      });
      return o;
    };
    magnificPopup = $.magnificPopup.instance;
    $('.btn-popup').magnificPopup({
      type: 'inline',
      preloader: false,
      focus: '#inputName',
      removalDelay: 500,
      mainClass: 'mfp-move-from-top'
    });
    $('#inputDate').datepicker({
      language: 'ru',
      orientation: 'bottom'
    });
    $popupForm = $('.popup-form');
    $popupForm.validator().on('submit', function(e) {
      var $target, formData, formDataArr, formMessage;
      if (e.isDefaultPrevented()) {
        return console.log('validation fail');
      } else {
        e.preventDefault();
        $target = $(e.target);
        formDataArr = $target.serializeArray();
        formMessage = '<table cellspacing="0" cellpadding="10" border="0" width="100%"><tbody>';
        formDataArr.forEach(function(element) {
          if (element.name !== '_subject') {
            return formMessage = formMessage.concat("<tr> <td align='right' valign='top' style='padding:5px 5px 5px 0;' width='200'> <strong> " + element.name + ":</strong> </td> <td align='left' valign='top' style='padding:5px 5px 5px 0;' width='*'> " + element.value + "</td> </tr> ");
          }
        });
        formMessage = formMessage.concat('</tbody></table>');
        formData = $target.serializeObject();
        if (formData['email'] == null) {
          formData['email'] = 'info@gildia-catering.ru';
        }
        return $.ajax({
          type: 'POST',
          url: 'https://mandrillapp.com/api/1.0/messages/send.json',
          data: {
            key: 'EKZL8t3uhKvqmT5Gx3rz_w',
            message: {
              from_email: formData['email'],
              from_name: formData['Ваше имя'],
              headers: {
                'Reply-To': formData['email']
              },
              html: formMessage,
              subject: formData['_subject'],
              to: [
                {
                  email: 'info@gildia-catering.ru'
                }
              ]
            }
          },
          success: function(data) {
            $('#popup-alert-success').magnificPopup({
              items: {
                src: '#popup-alert-success',
                type: 'inline'
              }
            }).magnificPopup('open');
            return setTimeout(function() {
              e.target.reset();
              return magnificPopup.close();
            }, 700);
          },
          error: function(xhr, str) {
            console.error(xhr);
            console.error(str);
            return alert('Возникла ошибка: ' + xhr.responseCode);
          }
        });
      }
    });
    $('#btn-top').affix({
      offset: {
        top: 500,
        bottom: 200
      }
    });
    $('#btn-top').on('click', function(e) {
      e.preventDefault();
      return $('body,html').animate({
        scrollTop: 0
      }, 700);
    });
    lightboxImages = function(slector) {
      return $(slector).magnificPopup({
        delegate: 'a',
        type: 'image',
        closeOnContentClick: false,
        closeBtnInside: false,
        mainClass: 'mfp-with-zoom mfp-img-mobile',
        image: {
          verticalFit: true
        },
        gallery: {
          enabled: true
        },
        zoom: {
          enabled: true,
          duration: 300,
          opener: function(element) {
            return element.find('img');
          }
        }
      });
    };
    $.fn.gphoto.provider['ggrid'] = {
      filter: function(imageUrl, image) {
        return {
          imageUrl: imageUrl,
          data: image
        };
      },
      insert: function($link, images) {
        var $ggrid, options;
        $ggrid = $('<div class="ggrid"></div>');
        options = {
          data: images
        };
        if ($link.attr("title") != null) {
          options['template'] = $link.attr("title");
        }
        $link.replaceWith($ggrid);
        $ggrid.ggrid($.extend(options, this));
        if (this.lightbox) {
          return lightboxImages(".ggrid");
        }
      }
    };
    $('a.gphoto-ggrid-lightbox').gphoto({
      provider: 'ggrid',
      columns: 3,
      maxWidth: 1170,
      padding: 5,
      lightbox: true
    });
    $('a.gphoto-ggrid-about').gphoto({
      provider: 'ggrid',
      columns: 2,
      maxWidth: 800,
      padding: 5,
      template: '1-2-2',
      lightbox: true
    });
    $.fn.gphoto.provider['swiper'] = {
      filter: function(imageUrl, image) {
        return {
          image: imageUrl + "/" + this.imageSize + "/",
          thumb: imageUrl + "/" + this.thumbSize + "/"
        };
      },
      insert: function($link, images) {
        var $swiper, $swiperWrapper, btnCntrSelector;
        $swiper = $('<div class="swiper-container"></div>');
        $swiperWrapper = $('<div class="swiper-wrapper"></div>');
        $.each(images, function(index, element) {
          return $swiperWrapper.append("<div class=\"swiper-slide\">\n   <a href=\"" + element.image + "\" data-effect=\"mfp-zoom-in\">\n      <img src=\"" + element.thumb + "\" class=\"img-responsive\"/>\n    </a>\n</div>");
        });
        $swiper.append($swiperWrapper);
        $swiper.addClass(this.containerClass);
        $link.replaceWith($swiper);
        btnCntrSelector = $link.data("buttonContainer");
        new Swiper($swiper, jQuery.extend(this.swiper, {
          nextButton: btnCntrSelector + " .swiper-button-next",
          prevButton: btnCntrSelector + " .swiper-button-prev"
        }));
        return lightboxImages("." + this.containerClass);
      }
    };
    $('a.swiper-link-gallery').gphoto({
      provider: 'swiper',
      imageSize: 'w1600',
      thumbSize: 'w300-h300-c',
      containerClass: 'swiper-gallery',
      swiper: {
        paginationClickable: true,
        effect: 'coverflow',
        grabCursor: true,
        centeredSlides: false,
        slidesPerView: 'auto',
        coverflow: {
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true
        }
      }
    });
    $('a.swiper-link-carousel').gphoto({
      provider: 'swiper',
      imageSize: 'w1600',
      thumbSize: 'w300-h200-c',
      containerClass: 'swiper-carousel',
      swiper: {
        loop: true,
        nextButton: '#swiperCarouselBtn .swiper-button-next',
        prevButton: '#swiperCarouselBtn .swiper-button-prev',
        slidesPerView: 4,
        slidesPerGroup: 4,
        paginationClickable: true,
        spaceBetween: 20
      }
    });
    $('a.swiper-link-artists').gphoto({
      provider: 'swiper',
      imageSize: 'w1600',
      thumbSize: 'w150-h150-c',
      containerClass: 'swiper-artists',
      swiper: {
        loop: true,
        nextButton: '#swiperCarouselBtn .swiper-button-next',
        prevButton: '#swiperCarouselBtn .swiper-button-prev',
        slidesPerView: 3,
        slidesPerGroup: 3,
        paginationClickable: true,
        spaceBetween: 10
      }
    });
    $('#accordion a').one('click', function() {
      return $(this).closest('.panel').find('.swiper-container').each(function() {
        return setTimeout((function(_this) {
          return function() {
            return _this.swiper.update(true);
          };
        })(this), 100);
      });
    });
    $('#accordion .fa-angle-left').on('click', function(e) {
      return $(this).parent().parent().find('.swiper-container')[0].swiper.slidePrev();
    });
    $('#accordion .fa-angle-right').on('click', function(e) {
      return $(this).parent().parent().find('.swiper-container')[0].swiper.slideNext();
    });
    swiperCarousel = new Swiper('.swiper-carousel', {
      loop: true,
      nextButton: '#btnClients .swiper-button-next',
      prevButton: '#btnClients .swiper-button-prev',
      slidesPerView: 4,
      slidesPerGroup: 4,
      paginationClickable: true,
      spaceBetween: 20
    });
    $("#food .nav-btns-menu a").click(function(e) {
      e.preventDefault();
      $(this).parent().find('a').removeClass('selected');
      $(this).addClass('selected');
      return $(this).tab('show');
    });
    $('#food .nav-btns-person a').click(function(e) {
      e.preventDefault();
      $(this).closest('.tab-pane').find('.nav-btns-person a').removeClass('selected');
      $(this).addClass('selected');
      $(this).closest('.tab-pane').find('.nav-btns-person a[href="' + $(this).attr('href') + '"]').addClass('selected');
      return $(this).tab('show');
    });
    $('#food .nav-btns-person:hidden a:nth-child(1)').click();
    $('#food .nav-btns-menu a:first').click();
    return $('#food .table').each(function() {
      return $('tr.td').filter(':odd').addClass('even');
    });
  });
})(jQuery);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpxdWVyeS5ncGhvdG8uY29mZmVlIiwianF1ZXJ5LmdncmlkLmNvZmZlZSIsInNpdGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLENBQUMsU0FBQyxDQUFELEdBQUE7QUFDQyxFQUFBLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTCxDQUNFO0FBQUEsSUFBQSxNQUFBLEVBQVEsU0FBQyxPQUFELEdBQUE7QUFDTixVQUFBLGtCQUFBO0FBQUEsTUFBQSxRQUFBLEdBQ0U7QUFBQSxRQUFBLFFBQUEsRUFBVSxVQUFWO09BREYsQ0FBQTtBQUFBLE1BR0EsUUFBQSxHQUFXLENBQUMsQ0FBQyxNQUFGLENBQVMsUUFBVCxFQUFtQixPQUFuQixDQUhYLENBQUE7QUFBQSxNQUlBLFFBQUEsR0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUp2QixDQUFBO0FBT0EsYUFBTyxJQUFDLENBQUMsTUFBRixDQUFTLHNEQUFULENBQWdFLENBQUMsSUFBakUsQ0FBc0UsU0FBQSxHQUFBO0FBQzNFLFlBQUEsMkJBQUE7QUFBQSxRQUFBLEtBQUEsR0FBUSxDQUFBLENBQUUsSUFBRixDQUFSLENBQUE7QUFBQSxRQUNBLEdBQUEsR0FBVSxJQUFBLEdBQUEsQ0FBSSxLQUFLLENBQUMsSUFBTixDQUFXLE1BQVgsQ0FBSixDQURWLENBQUE7QUFBQSxRQUVBLE1BQUEsR0FBUyxHQUFHLENBQUMsT0FBSixDQUFZLENBQVosQ0FGVCxDQUFBO0FBQUEsUUFHQSxPQUFBLEdBQVUsR0FBRyxDQUFDLE9BQUosQ0FBWSxDQUFaLENBSFYsQ0FBQTtlQUlBLENBQUMsQ0FBQyxPQUFGLENBQ0Usa0RBQUEsR0FBbUQsTUFBbkQsR0FBMEQsV0FBMUQsR0FBcUUsT0FBckUsR0FBNkUseURBRC9FLEVBRUUsU0FBQyxJQUFELEVBQU8sTUFBUCxHQUFBO0FBQ0UsY0FBQSxNQUFBO0FBQUEsVUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FB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R0EsQ0FBQSxDQUFFLElBQUYsQ0FBSSxDQUFDLE9BQUwsQ0FBYSxXQUFiLENBQXlCLENBQUMsSUFBMUIsQ0FBK0IsMkJBQUEsR0FBNEIsQ0FBQSxDQUFFLElBQUYsQ0FBSSxDQUFDLElBQUwsQ0FBVSxNQUFWLENBQTVCLEdBQThDLElBQTdFLENBQWtGLENBQUMsUUFBbkYsQ0FBNEYsVUFBNUYsQ0FIQSxDQUFBO2FBSUEsQ0FBQSxDQUFFLElBQUYsQ0FBTyxDQUFDLEdBQVIsQ0FBWSxNQUFaLEVBTGtDO0lBQUEsQ0FBcEMsQ0FsWEEsQ0FBQTtBQUFBLElBeVhBLENBQUEsQ0FBRSw4Q0FBRixDQUFpRCxDQUFDLEtBQWxELENBQUEsQ0F6WEEsQ0FBQTtBQUFBLElBMFhBLENBQUEsQ0FBRSw4QkFBRixDQUFpQyxDQUFDLEtBQWxDLENBQUEsQ0ExWEEsQ0FBQTtXQTRYQSxDQUFBLENBQUUsY0FBRixDQUFpQixDQUFDLElBQWxCLENBQXVCLFNBQUEsR0FBQTthQUNyQixDQUFBLENBQUUsT0FBRixDQUFVLENBQUMsTUFBWCxDQUFrQixNQUFsQixDQUF5QixDQUFDLFFBQTFCLENBQW1DLE1BQW5DLEVBRHFCO0lBQUEsQ0FBdkIsRUE5WEE7RUFBQSxDQUFGLEVBREQ7QUFBQSxDQUFELENBQUEsQ0FvWUUsTUFwWUYsQ0FBQSxDQUFBIiwiZmlsZSI6InNpdGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoKCQpIC0+XG4gICQuZm4uZXh0ZW5kXG4gICAgZ3Bob3RvOiAob3B0aW9ucykgLT5cbiAgICAgIHNldHRpbmdzID1cbiAgICAgICAgcHJvdmlkZXI6ICdmb3RvcmFtYSdcblxuICAgICAgc2V0dGluZ3MgPSAkLmV4dGVuZCBzZXR0aW5ncywgb3B0aW9uc1xuICAgICAgcHJvdmlkZXIgPSAkLmZuLmdwaG90by5wcm92aWRlclxuXG4gICAgICAjIGJvZHkgc2NyaXB0XG4gICAgICByZXR1cm4gQC5maWx0ZXIoXCJbaHJlZiBePSBodHRwc1xcXFw6XFxcXC9cXFxcL3BsdXNcXFxcLmdvb2dsZVxcXFwuY29tXFxcXC9waG90b3NdXCIpLmVhY2ggKCkgLT5cbiAgICAgICAgJGxpbmsgPSAkKEApXG4gICAgICAgIHVybCA9IG5ldyBVUkkoJGxpbmsuYXR0cignaHJlZicpKVxuICAgICAgICB1c2VySWQgPSB1cmwuc2VnbWVudCgxKVxuICAgICAgICBhbGJ1bUlkID0gdXJsLnNlZ21lbnQoMylcbiAgICAgICAgJC5nZXRKU09OKFxuICAgICAgICAgIFwiaHR0cHM6Ly9waWNhc2F3ZWIuZ29vZ2xlLmNvbS9kYXRhL2ZlZWQvYXBpL3VzZXIvI3t1c2VySWR9L2FsYnVtaWQvI3thbGJ1bUlkfT9raW5kPXBob3RvJmFjY2Vzcz1wdWJsaWMmYWx0PWpzb24taW4tc2NyaXB0JmNhbGxiYWNrPT9cIixcbiAgICAgICAgICAoZGF0YSwgc3RhdHVzKSAtPlxuICAgICAgICAgICAgaW1hZ2VzID0gZGF0YS5mZWVkLmVudHJ5Lm1hcCAoaW1hZ2UpIC0+XG4gICAgICAgICAgICAgIHVybCA9ICBuZXcgVVJJKGltYWdlLmNvbnRlbnQuc3JjKVxuICAgICAgICAgICAgICBpbWFnZVVybCA9IFwiI3t1cmwucHJvdG9jb2woKX06Ly8je3VybC5ob3N0KCl9I3t1cmwuZGlyZWN0b3J5KCl9XCJcbiAgICAgICAgICAgICAgcHJvdmlkZXJbc2V0dGluZ3MucHJvdmlkZXJdLmZpbHRlci5jYWxsKHNldHRpbmdzLCBpbWFnZVVybCwgaW1hZ2UpXG4gICAgICAgICAgICBwcm92aWRlcltzZXR0aW5ncy5wcm92aWRlcl0uaW5zZXJ0LmNhbGwoc2V0dGluZ3MsICRsaW5rLCBpbWFnZXMpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgKVxuIyBpbml0IGRlZmF1bHQgcHJvdmlkZXJzXG4jIHRvZG8tbWUgbmVlZCByZXN0IGFmdGVyIHJlZmFjdG9yXG4gICQuZm4uZ3Bob3RvLnByb3ZpZGVyID1cbiAgICBmb3RvcmFtYTpcbiAgICAgIGZpbHRlcjogKGltYWdlVXJsLCBpbWFnZSkgLT5cbiAgICAgICAgaW1nOiBcIiN7aW1hZ2VVcmx9dzAvXCJcbiAgICAgICAgdGh1bWI6IFwiI3tpbWFnZVVybH13NjQtaDY0L1wiXG4gICAgICBpbnNlcnQ6ICgkbGluaywgaW1hZ2VzKSAtPlxuICAgICAgICAkZm90b3JhbWEgPSAkKCc8ZGl2IGNsYXNzPVwiZm90b3JhbWFcIj48L2Rpdj4nKVxuICAgICAgICAkbGluay5yZXBsYWNlV2l0aCgkZm90b3JhbWEpXG4gICAgICAgICRmb3RvcmFtYS5mb3RvcmFtYSAkLmV4dGVuZCBkYXRhOiBpbWFnZXMsIEBcbiAgICAgICAgcmV0dXJuXG4gICAgZ2dyaWQ6XG4gICAgICBmaWx0ZXI6IChpbWFnZVVybCwgaW1hZ2UpIC0+XG4gICAgICAgIGltYWdlVXJsOiBpbWFnZVVybFxuICAgICAgICBkYXRhOiBpbWFnZVxuICAgICAgaW5zZXJ0OiAoJGxpbmssIGltYWdlcykgLT5cbiAgICAgICAgJGdncmlkID0gJCgnPGRpdiBjbGFzcz1cImdncmlkXCI+PC9kaXY+JylcbiAgICAgICAgb3B0aW9ucyA9IGRhdGE6IGltYWdlc1xuICAgICAgICBpZiAkbGluay5hdHRyKFwidGl0bGVcIik/XG4gICAgICAgICAgb3B0aW9uc1sndGVtcGxhdGUnXSA9ICAkbGluay5hdHRyKFwidGl0bGVcIilcbiAgICAgICAgJGxpbmsucmVwbGFjZVdpdGgoJGdncmlkKVxuICAgICAgICAkZ2dyaWQuZ2dyaWQgJC5leHRlbmQgb3B0aW9ucywgQFxuICAgICAgICAkZ2dyaWQuZmluZCgnYScpLmZsdWlkYm94KClcbiAgICAgICAgcmV0dXJuXG4pIGpRdWVyeVxuIiwiKCgkKSAtPlxuICAkLmZuLmV4dGVuZFxuICAgIGdncmlkOiAob3B0aW9ucykgLT5cbiAgICAgICR0aGlzID0gQFxuXG4gICAgICBzZXR0aW5ncyA9XG4gICAgICAgIGNvbHVtbnM6IDRcbiAgICAgICAgbWF4V2lkdGg6IDExNzBcbiAgICAgICAgcGFkZGluZzogNVxuXG4gICAgICBzZXR0aW5ncyA9ICQuZXh0ZW5kIHNldHRpbmdzLCBvcHRpb25zXG5cbiAgICAgIG1ldGhvZHMgPVxuICAgICAgICBtYWtlUm93OiAoaW1hZ2VzKSAtPlxuICAgICAgICAgICRvdXQgPSAkKFwiPGRpdiBkYXRhLXBhcmFncmFwaC1jb3VudD0nI3tpbWFnZXMubGVuZ3RofScgY2xhc3M9J3Jvdyc+PC9kaXY+XCIpXG4gICAgICAgICAgY29uc3RhbnRhID0gMS9pbWFnZXMucmVkdWNlUmlnaHQgKG9uZSwgdHdvKSAtPlxuICAgICAgICAgICAgKGlmIG9uZS5kYXRhIHRoZW4gMS8oTnVtYmVyKG9uZS5kYXRhLmdwaG90byRoZWlnaHQuJHQpL051bWJlcihvbmUuZGF0YS5ncGhvdG8kd2lkdGguJHQpKSBlbHNlIG9uZSkgK1x0MS8oTnVtYmVyKHR3by5kYXRhLmdwaG90byRoZWlnaHQuJHQpL051bWJlcih0d28uZGF0YS5ncGhvdG8kd2lkdGguJHQpKSBpZiBpbWFnZXMubGVuZ3RoICE9IDFcbiAgICAgICAgICBmb3IgaW1hZ2UgaW4gaW1hZ2VzXG4gICAgICAgICAgICBpZiBpbWFnZXMubGVuZ3RoICE9IDFcbiAgICAgICAgICAgICAgd2lkdGggPSBjb25zdGFudGEvKE51bWJlcihpbWFnZS5kYXRhLmdwaG90byRoZWlnaHQuJHQpL051bWJlcihpbWFnZS5kYXRhLmdwaG90byR3aWR0aC4kdCkpICogMTAwXG4gICAgICAgICAgICAgIG1heFdpZHRoID0gTWF0aC5yb3VuZCggc2V0dGluZ3MubWF4V2lkdGgvMTAwICogd2lkdGgpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHdpZHRoID0gMTAwXG4gICAgICAgICAgICAgIG1heFdpZHRoID0gMFxuICAgICAgICAgICAgJG91dC5hcHBlbmQgXCJcIlwiXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9J2NvbCcgc3R5bGU9J3dpZHRoOiAje3dpZHRofSU7Jz5cbiAgICAgICAgICAgICAgICA8YSBocmVmPVwiI3tpbWFnZS5pbWFnZVVybH0vdzAvXCI+XG4gICAgICAgICAgICAgICAgICA8aW1nIGNsYXNzPSdpbWctcmVzcG9uc2l2ZScgc3JjPScje2ltYWdlLmltYWdlVXJsfS93I3ttYXhXaWR0aH0vJyBhbHQ9JycgLz5cbiAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAkdGhpcy5hcHBlbmQgJG91dFxuICAgICAgICAgIHJldHVyblxuXG4gICAgICBpbWFnZXMgPSAgb3B0aW9ucy5kYXRhXG4gICAgICB0ZW1wbGF0ZSA9IG9wdGlvbnMudGVtcGxhdGUuc3BsaXQoJy0nKSBpZiBvcHRpb25zLnRlbXBsYXRlP1xuICAgICAgY2h1bms7IGkgPSAwOyBpdGVyID0gMFxuICAgICAgd2hpbGUgaSA8IGltYWdlcy5sZW5ndGhcbiAgICAgICAgaWYgdGVtcGxhdGU/W2l0ZXJdXG4gICAgICAgICAgI2FkZCB0ZW1wbGF0ZSBsYXlvdXQgc3VwcG9ydCBpbiB0aXRsZSBhdHRyXG4gICAgICAgICAgY2h1bmsgPSBOdW1iZXIodGVtcGxhdGVbaXRlcl0pXG4gICAgICAgICAgaXRlcisrXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAjZG8gbm90IHNob3cgMSBpbW1hZ2UgdG8gZW5kIGdyaWRlXG4gICAgICAgICAgY2h1bmsgPSBpZiBpbWFnZXMubGVuZ3RoIC0gKGkgKyBzZXR0aW5ncy5jb2x1bW5zKSA9PSAxIHRoZW4gc2V0dGluZ3MuY29sdW1ucyAtIDEgZWxzZSBzZXR0aW5ncy5jb2x1bW5zXG4gICAgICAgIG1ldGhvZHMubWFrZVJvdyBpbWFnZXMuc2xpY2UoaSxpK2NodW5rKVxuICAgICAgICBpKz1jaHVua1xuICAgICAgIyBib2R5IHNjcmlwdFxuICAgICAgcmV0dXJuIEAuZWFjaCAoKSAtPlxuICAgICAgICBjb25zb2xlLmxvZygnZ2dyaWQnKVxuICAgICAgICByZXR1cm5cbikgalF1ZXJ5XG4iLCIoKCQpIC0+XG4gICQgLT5cbiMgICBoeXBoZW5hdGVcbiAgICAkKCcuaHlwaGVyJykuaHlwaGVuYXRlKCdydScpXG5cbiNyZWdpb24gICBtZW51XG4jICAgICQoJy5kcm9wZG93bi1mdWxsJykuaG92ZXIoLT5cbiMgICAgICBpZiAoISQoQCkuaGFzQ2xhc3MoJ29wZW4nKSlcbiMgICAgICAgICQoQCkuZmluZCgnLmRyb3Bkb3duLXRvZ2dsZScpLmRyb3Bkb3duKCd0b2dnbGUnKVxuIyAgICAsLT5cbiMgICAgICBpZiAoJChAKS5oYXNDbGFzcygnb3BlbicpKVxuIyAgICAgICAgJChAKS5maW5kKCcuZHJvcGRvd24tdG9nZ2xlJykuZHJvcGRvd24oJ3RvZ2dsZScpXG4jICAgIClcblxuICAgICRuYXZiYXJNYWluID0gJCgnI25hdmJhci1tYWluJylcbiAgICAkbmF2YmFyTWFpbkJ0biA9ICQoJyNuYXZiYXItbWFpbi1idG4nKVxuICAgICRmbGFnRG9jV2lkdGhYcyA9ICQod2luZG93KS53aWR0aCgpID4gNzY4XG4gICAgJGZsYWdOYXZiYXJNYWluU2Nyb2xsID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpID4gJCgnI25hdmJhci1tYWluLXRyaWdnZXInKS5vZmZzZXQoKS50b3BcbiAgICAkKCcjbmF2YmFyLW1haW4tdHJpZ2dlcicpLmFmZml4KHtcbiAgICAgIG9mZnNldDoge1xuICAgICAgICB0b3A6ICgpLT5cbiAgICAgICAgICBpZiAkZmxhZ0RvY1dpZHRoWHNcbiAgICAgICAgICAgICQoJyNuYXZiYXItbWFpbi10cmlnZ2VyJykub2Zmc2V0KCkudG9wXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgMTAwMDAwMDAwMDBcbiAgICAgIH1cbiAgICB9KS5vbignYWZmaXguYnMuYWZmaXgnLCAoKS0+XG4gICAgICAkbmF2YmFyTWFpbi5hZGRDbGFzcygnY29sbGFwc2UgYWZmaXgnKVxuICAgICAgJG5hdmJhck1haW5CdG4uc2hvdygpXG4gICAgKS5vbignYWZmaXgtdG9wLmJzLmFmZml4JywgKCktPlxuICAgICAgJG5hdmJhck1haW5CdG4uaGlkZSgpXG4gICAgICAkbmF2YmFyTWFpbi5yZW1vdmVDbGFzcygnY29sbGFwc2UgYWZmaXgnKVxuICAgIClcbiAgICBpZiAkZmxhZ05hdmJhck1haW5TY3JvbGwgIGFuZCAkZmxhZ0RvY1dpZHRoWHNcbiAgICAgICRuYXZiYXJNYWluLmFkZENsYXNzKCdjb2xsYXBzZSBhZmZpeCcpXG4gICAgICAkbmF2YmFyTWFpbkJ0bi5zaG93KClcblxuICAgIHVyaSA9IG5ldyBVUkkoKVxuICAgIHVyaVNlZ21lbnRGaXJzdCA9IHVyaS5zZWdtZW50KDApXG4gICAgJCgnI25hdmJhci1tYWluLWNvbGxhcHNlIHVsIGxpIGEnKS5lYWNoKCgpLT5cbiAgICAgICR0aGlzID0gJCh0aGlzKVxuICAgICAgaWYgJHRoaXMuYXR0cignaHJlZicpIGFuZCBuZXcgVVJJKCR0aGlzLmF0dHIoJ2hyZWYnKSkuc2VnbWVudCgwKSA9PSB1cmlTZWdtZW50Rmlyc3RcbiAgICAgICAgJHRoaXMucGFyZW50KCkuYWRkQ2xhc3MoJ2FjdGl2ZScpXG4gICAgKVxuICAgICQoJy5uYXYtYnRucy1hY3RpdmUgYScpLmVhY2ggKCktPlxuICAgICAgJHRoaXMgPSAkKHRoaXMpXG4gICAgICBpZiAkdGhpcy5hdHRyKCdocmVmJykgYW5kIG5ldyBVUkkoJHRoaXMuYXR0cignaHJlZicpKS5zZWdtZW50KDApID09IHVyaVNlZ21lbnRGaXJzdFxuICAgICAgICAkdGhpcy5hZGRDbGFzcygnc2VsZWN0ZWQnKVxuICAgIGlmIHVyaVNlZ21lbnRGaXJzdCA9PSBcImFydGljbGVzXCJcbiAgICAgICQoJyNuYXZiYXItbWFpbi1jb2xsYXBzZSB1bCBsaSBhW2hyZWY9XCIvbmV3cy9cIl0nKS5wYXJlbnQoKS5hZGRDbGFzcygnYWN0aXZlJylcbiAgICBjb25zb2xlLmxvZyh1cmlTZWdtZW50Rmlyc3QpXG4jZW5kcmVnaW9uXG5cbiNyZWdpb24gICBtYWluIHNsaWRlclxuICAgIGlmICgkKCcjc3dpcGVySW5kZXgnKVswXSlcbiAgICAgIFRpbWVySW50ZXJ2YWwgPSAoY2FsbGJhY2ssIGRlbGF5KSAtPlxuICAgICAgICB0aW1lcklkID0gdW5kZWZpbmVkXG4gICAgICAgIHJlbWFpbmluZyA9IGRlbGF5XG4gICAgICAgIEBwYXVzZSA9IC0+XG4gICAgICAgICAgY2xlYXJUaW1lb3V0IHRpbWVySWRcbiAgICAgICAgQHJlc3VtZSA9IC0+XG4gICAgICAgICAgY2xlYXJUaW1lb3V0IHRpbWVySWRcbiAgICAgICAgICB0aW1lcklkID0gc2V0SW50ZXJ2YWwoY2FsbGJhY2ssIHJlbWFpbmluZylcbiAgICAgICAgQHJlc3VtZSgpXG5cbiAgICAgIHN3aXBlckluZGV4ID0gbmV3IFN3aXBlcignI3N3aXBlckluZGV4Jywge1xuICAgICAgICBsb29wOiB0cnVlXG4gICAgICAgIG5leHRCdXR0b246ICAnI3N3aXBlckluZGV4IC5pY29uLXJpZ2h0J1xuICAgICAgICBwcmV2QnV0dG9uOiAnI3N3aXBlckluZGV4IC5pY29uLWxlZnQnXG4gICAgICAgIHNsaWRlc1BlclZpZXc6IDFcbiAgICAgICAgZWZmZWN0OiAnZmFkZSdcbiAgICAgICAgc3BlZWQ6IDEwMDBcbiAgICAgICAgcGFnaW5hdGlvbkNsaWNrYWJsZTogdHJ1ZVxuICAgICAgfSlcblxuICAgICAgc2xpZGVyVGltZXIgPSBuZXcgVGltZXJJbnRlcnZhbCAoKS0+XG4gICAgICAgIHN3aXBlckluZGV4LnVwZGF0ZSh0cnVlKVxuICAgICAgICBzd2lwZXJJbmRleC5zbGlkZU5leHQoKVxuICAgICAgLCAkKCcjc3dpcGVySW5kZXgnKS5kYXRhKCdzbGlkZXJUaW1lb3V0JylcblxuICAgICAgc2xpZGVyVGltZXJBdXRvcGxheSA9IG51bGxcbiAgICAgICQoJyNzZXJ2aWNlVGFicyAudGFiLCAjc3dpcGVySW5kZXgnKS5ob3ZlcihcbiAgICAgICAgLT5cbiAgICAgICAgICBjbGVhclRpbWVvdXQoc2xpZGVyVGltZXJBdXRvcGxheSkgaWYgc2xpZGVyVGltZXJBdXRvcGxheVxuICAgICAgICAgIHNsaWRlclRpbWVyQXV0b3BsYXkgPSBzZXRUaW1lb3V0ICgpIC0+XG4gICAgICAgICAgICBzbGlkZXJUaW1lci5wYXVzZSgpXG4gICMgICAgICAgICAgY29uc29sZS5sb2coJ2VuZCcpXG4gICAgICAgICAgLCAxMDBcbiAgICAgICAgLC0+XG4gICAgICAgICAgc2xpZGVyVGltZXJBdXRvcGxheSA9IHNldFRpbWVvdXQgKCkgLT5cbiAgICAgICAgICAgIHNsaWRlclRpbWVyLnJlc3VtZSgpXG4gICMgICAgICAgICAgY29uc29sZS5sb2coJ3N0YXJ0JylcbiAgICAgICAgICAsIDEwMFxuICAgICAgKVxuXG4gICAgICAkKCcjc2VydmljZVRhYnMgLnRhYicpLmVxKDApLmFkZENsYXNzICdob3ZlcidcbiAgICAgIHN3aXBlckluZGV4Lm9uICdzbGlkZUNoYW5nZVN0YXJ0JywgICgpLT5cbiAgICAgICAgaW5kZXggPSBzd2lwZXJJbmRleC5hY3RpdmVJbmRleCAtIDFcbiAgICAgICAgaW5kZXggPSAwIGlmKGluZGV4ID09IDgpXG4gICMgICAgICBjb25zb2xlLmxvZyhpbmRleClcbiAgICAgICAgJCgnI3NlcnZpY2VUYWJzIC50YWInKS5yZW1vdmVDbGFzcyAnaG92ZXInXG4gICAgICAgICQoJyNzZXJ2aWNlVGFicyAudGFiJykuZXEoaW5kZXgpLmFkZENsYXNzICdob3ZlcidcblxuICAgICAgc2xpZGVyVGltZXJIb3ZlciA9IG51bGxcbiAgICAgICQoJyNzZXJ2aWNlVGFicyAudGFiJykuaG92ZXIgLT5cbiAgICAgICAgY2xlYXJUaW1lb3V0KHNsaWRlclRpbWVySG92ZXIpIGlmIHNsaWRlclRpbWVySG92ZXJcbiAgICAgICAgc2xpZGVyVGltZXJIb3ZlciA9IHNldFRpbWVvdXQoICgpID0+XG4gICAgICAgICAgc3dpcGVySW5kZXguc2xpZGVUbyggJChAKS5pbmRleCgpICsgMSlcbiAgICAgICAgLCAkKCcjc3dpcGVySW5kZXgnKS5kYXRhKCdzbGlkZXJUaW1lb3V0SG92ZXInKSlcblxuI2VuZHJlZ2lvblxuXG4jcmVnaW9uICAgd2h5IHVzXG4gICAgdHJhbnNmb3JtID0gKGEsIGIpIC0+XG4gICAgICAjIHNldCB0aGUgc3RhZ2Ugc28gcmFtamV0IGNvcGllcyB0aGUgcmlnaHQgc3R5bGVzLi4uXG4gICAgICBiLmNsYXNzTGlzdC5yZW1vdmUgJ2hpZGRlbidcbiAgICAgIHJhbWpldC50cmFuc2Zvcm0gYSwgYiwgZG9uZTogLT5cbiAgICAgICAgIyB0aGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBhcyBzb29uIGFzIHRoZSB0cmFuc2l0aW9uIGNvbXBsZXRlc1xuICAgICAgICBiLmNsYXNzTGlzdC5yZW1vdmUgJ2hpZGRlbidcbiAgICAgICAgaWYoJChhKS5oYXNDbGFzcygnd2h5dXMtaW50cm8nKSlcbiAgICAgICAgICAkKCcud2h5dXMnKS5jc3MoJ21pbi1oZWlnaHQnLCAkKGIpLmZpbmQoJy5yb3cnKS5pbm5lckhlaWdodCgpICsgMjApXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAkKCcud2h5dXMnKS5jc3MoJ21pbi1oZWlnaHQnLCAnJylcbiAgICAgICMgLi4udGhlbiBoaWRlIHRoZSBvcmlnaW5hbCBlbGVtZW50cyBmb3IgdGhlIGR1cmF0aW9uIG9mIHRoZSB0cmFuc2l0aW9uXG4gICAgICBhLmNsYXNzTGlzdC5hZGQgJ2hpZGRlbidcbiAgICAgIGIuY2xhc3NMaXN0LmFkZCAnaGlkZGVuJ1xuXG4gICAgJCgnLndoeXVzLWludHJvJykuY2xpY2sgLT4gdHJhbnNmb3JtKEAsIEAubmV4dFNpYmxpbmcpXG4gICAgJCgnLndoeXVzLWRldGFpbCcpLmNsaWNrIC0+IHRyYW5zZm9ybShALCBALnByZXZpb3VzU2libGluZylcbiNlbmRyZWdpb25cblxuI3JlZ2lvbiAgIGxpZ2h0Ym94IGZvcm1cbiAgICAkLmZuLnNlcmlhbGl6ZU9iamVjdCA9IC0+XG4gICAgICBvID0ge31cbiAgICAgIGEgPSBAc2VyaWFsaXplQXJyYXkoKVxuICAgICAgJC5lYWNoIGEsIC0+XG4gICAgICAgIGlmIG9bQG5hbWVdICE9IHVuZGVmaW5lZFxuICAgICAgICAgIGlmICFvW0BuYW1lXS5wdXNoXG4gICAgICAgICAgICBvW0BuYW1lXSA9IFsgb1tAbmFtZV0gXVxuICAgICAgICAgIG9bQG5hbWVdLnB1c2ggQHZhbHVlIG9yICcnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBvW0BuYW1lXSA9IEB2YWx1ZSBvciAnJ1xuICAgICAgICByZXR1cm5cbiAgICAgIG9cbiAgICBtYWduaWZpY1BvcHVwID0gJC5tYWduaWZpY1BvcHVwLmluc3RhbmNlXG4gICAgJCgnLmJ0bi1wb3B1cCcpLm1hZ25pZmljUG9wdXBcbiAgICAgIHR5cGU6ICdpbmxpbmUnXG4gICAgICBwcmVsb2FkZXI6IGZhbHNlXG4gICAgICBmb2N1czogJyNpbnB1dE5hbWUnXG4gICAgICByZW1vdmFsRGVsYXk6IDUwMFxuICAgICAgbWFpbkNsYXNzOiAnbWZwLW1vdmUtZnJvbS10b3AnXG4gICAgJCgnI2lucHV0RGF0ZScpLmRhdGVwaWNrZXIoXG4gICAgICBsYW5ndWFnZTogJ3J1J1xuICAgICAgb3JpZW50YXRpb246ICdib3R0b20nXG4gICAgKVxuICAgICRwb3B1cEZvcm0gPSAkKCcucG9wdXAtZm9ybScpXG4gICAgJHBvcHVwRm9ybS52YWxpZGF0b3IoKS5vbiAnc3VibWl0JywgKGUpIC0+XG4gICAgICBpZiBlLmlzRGVmYXVsdFByZXZlbnRlZCgpXG4gICAgICAgIGNvbnNvbGUubG9nKCd2YWxpZGF0aW9uIGZhaWwnKVxuICAgICAgZWxzZVxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgJHRhcmdldCA9ICQoZS50YXJnZXQpXG4gICAgICAgIGZvcm1EYXRhQXJyID0gJHRhcmdldC5zZXJpYWxpemVBcnJheSgpXG4gICAgICAgIGZvcm1NZXNzYWdlID0gJzx0YWJsZSBjZWxsc3BhY2luZz1cIjBcIiBjZWxscGFkZGluZz1cIjEwXCIgYm9yZGVyPVwiMFwiIHdpZHRoPVwiMTAwJVwiPjx0Ym9keT4nXG4gICAgICAgIGZvcm1EYXRhQXJyLmZvckVhY2ggKGVsZW1lbnQpIC0+XG4gICAgICAgICAgZm9ybU1lc3NhZ2UgPSBmb3JtTWVzc2FnZS5jb25jYXQgXCI8dHI+XG4gICAgICAgICAgICAgIDx0ZCBhbGlnbj0ncmlnaHQnIHZhbGlnbj0ndG9wJyBzdHlsZT0ncGFkZGluZzo1cHggNXB4IDVweCAwOycgd2lkdGg9JzIwMCc+IDxzdHJvbmc+ICN7ZWxlbWVudC5uYW1lfTo8L3N0cm9uZz4gPC90ZD5cbiAgICAgICAgICAgICAgPHRkIGFsaWduPSdsZWZ0JyB2YWxpZ249J3RvcCcgc3R5bGU9J3BhZGRpbmc6NXB4IDVweCA1cHggMDsnIHdpZHRoPScqJz4gI3tlbGVtZW50LnZhbHVlfTwvdGQ+XG4gICAgICAgICAgICA8L3RyPiBcIiBpZiBlbGVtZW50Lm5hbWUgIT0gJ19zdWJqZWN0J1xuICAgICAgICBmb3JtTWVzc2FnZSA9IGZvcm1NZXNzYWdlLmNvbmNhdCAnPC90Ym9keT48L3RhYmxlPidcbiAgICAgICAgZm9ybURhdGEgPSAkdGFyZ2V0LnNlcmlhbGl6ZU9iamVjdCgpXG4gICAgICAgIGZvcm1EYXRhWydlbWFpbCddID89ICdpbmZvQGdpbGRpYS1jYXRlcmluZy5ydSdcbiAgICAgICAgJC5hamF4XG4gICAgICAgICAgdHlwZTogJ1BPU1QnXG4gICAgICAgICAgdXJsOiAnaHR0cHM6Ly9tYW5kcmlsbGFwcC5jb20vYXBpLzEuMC9tZXNzYWdlcy9zZW5kLmpzb24nXG4gICAgICAgICAgZGF0YTpcbiAgICAgICAgICAgIGtleTogJ0VLWkw4dDN1aEt2cW1UNUd4M3J6X3cnXG4gICAgICAgICAgICBtZXNzYWdlOlxuICAgICAgICAgICAgICBmcm9tX2VtYWlsOiBmb3JtRGF0YVsnZW1haWwnXVxuICAgICAgICAgICAgICBmcm9tX25hbWU6IGZvcm1EYXRhWyfQktCw0YjQtSDQuNC80Y8nXVxuICAgICAgICAgICAgICBoZWFkZXJzOlxuICAgICAgICAgICAgICAgICdSZXBseS1Ubyc6IGZvcm1EYXRhWydlbWFpbCddXG4gICAgICAgICAgICAgIGh0bWw6IGZvcm1NZXNzYWdlXG4gICAgICAgICAgICAgIHN1YmplY3Q6IGZvcm1EYXRhWydfc3ViamVjdCddXG4gICAgICAgICAgICAgIHRvOiBbXG4gICAgICAgICAgICAgICAgZW1haWw6ICdpbmZvQGdpbGRpYS1jYXRlcmluZy5ydSdcbiAgICAgICAgICAgICAgXVxuICAgICAgICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgICAgICAgJCgnI3BvcHVwLWFsZXJ0LXN1Y2Nlc3MnKS5tYWduaWZpY1BvcHVwKGl0ZW1zOlxuICAgICAgICAgICAgICBzcmM6ICcjcG9wdXAtYWxlcnQtc3VjY2VzcydcbiAgICAgICAgICAgICAgdHlwZTogJ2lubGluZScpLm1hZ25pZmljUG9wdXAgJ29wZW4nXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpLT5cbiAgICAgICAgICAgICAgZS50YXJnZXQucmVzZXQoKVxuICAgICAgICAgICAgICBtYWduaWZpY1BvcHVwLmNsb3NlKClcbiAgICAgICAgICAgICwgNzAwKVxuICAgICAgICAgIGVycm9yOiAoeGhyLCBzdHIpIC0+XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKHhocilcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3Ioc3RyKVxuICAgICAgICAgICAgYWxlcnQoJ9CS0L7Qt9C90LjQutC70LAg0L7RiNC40LHQutCwOiAnICsgeGhyLnJlc3BvbnNlQ29kZSlcbiNlbmRyZWdpb25cblxuI3JlZ2lvbiAgICNidG4gc2Nyb2xsIHRvcFxuICAgICQoJyNidG4tdG9wJykuYWZmaXhcbiAgICAgIG9mZnNldDpcbiAgICAgICAgdG9wOiA1MDBcbiAgICAgICAgYm90dG9tOiAyMDBcbiAgICAkKCcjYnRuLXRvcCcpLm9uICdjbGljaycsIChlKS0+XG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICQoJ2JvZHksaHRtbCcpLmFuaW1hdGVcbiAgICAgICAgICBzY3JvbGxUb3A6IDBcbiAgICAgICAgLCA3MDBcbiNlbmRyZWdpb25cblxuI3JlZ2lvbiAgIGxpZ2h0Ym94IGltYWdlcyBnYWxsZXJ5XG4gICAgbGlnaHRib3hJbWFnZXMgPSAoc2xlY3RvcikgLT5cbiAgICAgICQoc2xlY3RvcikubWFnbmlmaWNQb3B1cFxuICAgICAgICBkZWxlZ2F0ZTogJ2EnXG4gICAgICAgIHR5cGU6ICdpbWFnZSdcbiAgICAgICAgY2xvc2VPbkNvbnRlbnRDbGljazogZmFsc2VcbiAgICAgICAgY2xvc2VCdG5JbnNpZGU6IGZhbHNlXG4gICAgICAgIG1haW5DbGFzczogJ21mcC13aXRoLXpvb20gbWZwLWltZy1tb2JpbGUnXG4gICAgICAgIGltYWdlOlxuICAgICAgICAgIHZlcnRpY2FsRml0OiB0cnVlXG4gICAgICAgIGdhbGxlcnk6IGVuYWJsZWQ6IHRydWVcbiAgICAgICAgem9vbTpcbiAgICAgICAgICBlbmFibGVkOiB0cnVlXG4gICAgICAgICAgZHVyYXRpb246IDMwMFxuICAgICAgICAgIG9wZW5lcjogKGVsZW1lbnQpIC0+XG4gICAgICAgICAgICBlbGVtZW50LmZpbmQgJ2ltZydcbiNlbmRyZWdpb25cblxuI3JlZ2lvbiAgIGdwaG90byBpbWFnZXMgZ3JpZFxuICAgICQuZm4uZ3Bob3RvLnByb3ZpZGVyWydnZ3JpZCddID1cbiAgICAgIGZpbHRlcjogKGltYWdlVXJsLCBpbWFnZSkgLT5cbiAgICAgICAgaW1hZ2VVcmw6IGltYWdlVXJsXG4gICAgICAgIGRhdGE6IGltYWdlXG4gICAgICBpbnNlcnQ6ICgkbGluaywgaW1hZ2VzKSAtPlxuICAgICAgICAkZ2dyaWQgPSAkKCc8ZGl2IGNsYXNzPVwiZ2dyaWRcIj48L2Rpdj4nKVxuICAgICAgICBvcHRpb25zID0gZGF0YTogaW1hZ2VzXG4gICAgICAgIGlmICRsaW5rLmF0dHIoXCJ0aXRsZVwiKT9cbiAgICAgICAgICBvcHRpb25zWyd0ZW1wbGF0ZSddID0gICRsaW5rLmF0dHIoXCJ0aXRsZVwiKVxuICAgICAgICAkbGluay5yZXBsYWNlV2l0aCgkZ2dyaWQpXG4gICAgICAgICRnZ3JpZC5nZ3JpZCAkLmV4dGVuZCBvcHRpb25zLCBAXG4gICAgICAgIGxpZ2h0Ym94SW1hZ2VzKFwiLmdncmlkXCIpIGlmIEAubGlnaHRib3hcblxuICAgICQoJ2EuZ3Bob3RvLWdncmlkLWxpZ2h0Ym94JykuZ3Bob3RvKFxuICAgICAgcHJvdmlkZXI6ICdnZ3JpZCdcbiAgICAgIGNvbHVtbnM6IDNcbiAgICAgIG1heFdpZHRoOiAxMTcwXG4gICAgICBwYWRkaW5nOiA1XG4gICAgICBsaWdodGJveDogdHJ1ZVxuICAgIClcblxuICAgICQoJ2EuZ3Bob3RvLWdncmlkLWFib3V0JykuZ3Bob3RvKFxuICAgICAgcHJvdmlkZXI6ICdnZ3JpZCdcbiAgICAgIGNvbHVtbnM6IDJcbiAgICAgIG1heFdpZHRoOiA4MDBcbiAgICAgIHBhZGRpbmc6IDVcbiAgICAgIHRlbXBsYXRlOiAnMS0yLTInXG4gICAgICBsaWdodGJveDogdHJ1ZVxuICAgIClcbiNlbmRyZWdpb25cblxuI3JlZ2lvbiBncGhvdG8gZ2FsbGVyeVxuICAgICQuZm4uZ3Bob3RvLnByb3ZpZGVyWydzd2lwZXInXSA9XG4gICAgICBmaWx0ZXI6IChpbWFnZVVybCwgaW1hZ2UpLT5cbiAgICAgICAgaW1hZ2U6IFwiI3tpbWFnZVVybH0vI3tALmltYWdlU2l6ZX0vXCJcbiAgICAgICAgdGh1bWI6IFwiI3tpbWFnZVVybH0vI3tALnRodW1iU2l6ZX0vXCJcbiAgICAgIGluc2VydDogKCRsaW5rLCBpbWFnZXMpLT5cbiAgICAgICAgJHN3aXBlciA9ICQoJzxkaXYgY2xhc3M9XCJzd2lwZXItY29udGFpbmVyXCI+PC9kaXY+JylcbiAgICAgICAgJHN3aXBlcldyYXBwZXIgPSAkKCc8ZGl2IGNsYXNzPVwic3dpcGVyLXdyYXBwZXJcIj48L2Rpdj4nKVxuICAgICAgICAkLmVhY2goaW1hZ2VzLCAoaW5kZXgsIGVsZW1lbnQpLT5cbiAgICAgICAgICAkc3dpcGVyV3JhcHBlci5hcHBlbmQoXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzd2lwZXItc2xpZGVcIj5cbiAgICAgICAgICAgICAgIDxhIGhyZWY9XCIje2VsZW1lbnQuaW1hZ2V9XCIgZGF0YS1lZmZlY3Q9XCJtZnAtem9vbS1pblwiPlxuICAgICAgICAgICAgICAgICAgPGltZyBzcmM9XCIje2VsZW1lbnQudGh1bWJ9XCIgY2xhc3M9XCJpbWctcmVzcG9uc2l2ZVwiLz5cbiAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgICAkc3dpcGVyLmFwcGVuZCgkc3dpcGVyV3JhcHBlcilcbiAgICAgICAgJHN3aXBlci5hZGRDbGFzcyhALmNvbnRhaW5lckNsYXNzKVxuICAgICAgICAkbGluay5yZXBsYWNlV2l0aCgkc3dpcGVyKVxuICAgICAgICBidG5DbnRyU2VsZWN0b3IgPSAkbGluay5kYXRhKFwiYnV0dG9uQ29udGFpbmVyXCIpXG4gICAgICAgIG5ldyBTd2lwZXIoJHN3aXBlciwgalF1ZXJ5LmV4dGVuZChALnN3aXBlciwge1xuICAgICAgICAgIG5leHRCdXR0b246IFwiI3tidG5DbnRyU2VsZWN0b3J9IC5zd2lwZXItYnV0dG9uLW5leHRcIlxuICAgICAgICAgIHByZXZCdXR0b246IFwiI3tidG5DbnRyU2VsZWN0b3J9IC5zd2lwZXItYnV0dG9uLXByZXZcIlxuICAgICAgICB9KSlcbiAgICAgICAgbGlnaHRib3hJbWFnZXMoXCIuI3tALmNvbnRhaW5lckNsYXNzfVwiKVxuXG4gICAgJCgnYS5zd2lwZXItbGluay1nYWxsZXJ5JykuZ3Bob3RvKFxuICAgICAgcHJvdmlkZXI6ICdzd2lwZXInXG4gICAgICBpbWFnZVNpemU6ICd3MTYwMCdcbiAgICAgIHRodW1iU2l6ZTogJ3czMDAtaDMwMC1jJ1xuICAgICAgY29udGFpbmVyQ2xhc3M6ICdzd2lwZXItZ2FsbGVyeSdcbiAgICAgIHN3aXBlcjpcbiAgICAgICAgcGFnaW5hdGlvbkNsaWNrYWJsZTogdHJ1ZVxuICAgICAgICBlZmZlY3Q6ICdjb3ZlcmZsb3cnXG4gICAgICAgIGdyYWJDdXJzb3I6IHRydWVcbiAgICAgICAgY2VudGVyZWRTbGlkZXM6IGZhbHNlXG4gICAgICAgIHNsaWRlc1BlclZpZXc6ICdhdXRvJ1xuICAgICAgICBjb3ZlcmZsb3c6XG4gICAgICAgICAgcm90YXRlOiA1MFxuICAgICAgICAgIHN0cmV0Y2g6IDBcbiAgICAgICAgICBkZXB0aDogMTAwXG4gICAgICAgICAgbW9kaWZpZXI6IDFcbiAgICAgICAgICBzbGlkZVNoYWRvd3M6IHRydWVcbiAgICApXG5cbiAgICAkKCdhLnN3aXBlci1saW5rLWNhcm91c2VsJykuZ3Bob3RvKFxuICAgICAgcHJvdmlkZXI6ICdzd2lwZXInXG4gICAgICBpbWFnZVNpemU6ICd3MTYwMCdcbiAgICAgIHRodW1iU2l6ZTogJ3czMDAtaDIwMC1jJ1xuICAgICAgY29udGFpbmVyQ2xhc3M6ICdzd2lwZXItY2Fyb3VzZWwnXG4gICAgICBzd2lwZXI6XG4gICAgICAgIGxvb3A6IHRydWVcbiAgICAgICAgbmV4dEJ1dHRvbjogICcjc3dpcGVyQ2Fyb3VzZWxCdG4gLnN3aXBlci1idXR0b24tbmV4dCdcbiAgICAgICAgcHJldkJ1dHRvbjogJyNzd2lwZXJDYXJvdXNlbEJ0biAuc3dpcGVyLWJ1dHRvbi1wcmV2J1xuICAgICAgICBzbGlkZXNQZXJWaWV3OiA0XG4gICAgICAgIHNsaWRlc1Blckdyb3VwOiA0XG4gICAgICAgIHBhZ2luYXRpb25DbGlja2FibGU6IHRydWVcbiAgICAgICAgc3BhY2VCZXR3ZWVuOiAyMFxuICAgIClcblxuICAgICQoJ2Euc3dpcGVyLWxpbmstYXJ0aXN0cycpLmdwaG90byhcbiAgICAgIHByb3ZpZGVyOiAnc3dpcGVyJ1xuICAgICAgaW1hZ2VTaXplOiAndzE2MDAnXG4gICAgICB0aHVtYlNpemU6ICd3MTUwLWgxNTAtYydcbiAgICAgIGNvbnRhaW5lckNsYXNzOiAnc3dpcGVyLWFydGlzdHMnXG4gICAgICBzd2lwZXI6XG4gICAgICAgIGxvb3A6IHRydWVcbiAgICAgICAgbmV4dEJ1dHRvbjogICcjc3dpcGVyQ2Fyb3VzZWxCdG4gLnN3aXBlci1idXR0b24tbmV4dCdcbiAgICAgICAgcHJldkJ1dHRvbjogJyNzd2lwZXJDYXJvdXNlbEJ0biAuc3dpcGVyLWJ1dHRvbi1wcmV2J1xuICAgICAgICBzbGlkZXNQZXJWaWV3OiAzXG4gICAgICAgIHNsaWRlc1Blckdyb3VwOiAzXG4gICAgICAgIHBhZ2luYXRpb25DbGlja2FibGU6IHRydWVcbiAgICAgICAgc3BhY2VCZXR3ZWVuOiAxMFxuICAgIClcbiAgICAkKCcjYWNjb3JkaW9uIGEnKS5vbmUgJ2NsaWNrJywgKCktPlxuICAgICAgJChAKS5jbG9zZXN0KCcucGFuZWwnKS5maW5kKCcuc3dpcGVyLWNvbnRhaW5lcicpLmVhY2ggKCktPlxuICAgICAgICBzZXRUaW1lb3V0ICgpPT5cbiAgICAgICAgICBALnN3aXBlci51cGRhdGUodHJ1ZSlcbiAgICAgICAgLCAxMDBcbiAgICAkKCcjYWNjb3JkaW9uIC5mYS1hbmdsZS1sZWZ0Jykub24gJ2NsaWNrJywgKGUpLT5cbiAgICAgICQoQCkucGFyZW50KCkucGFyZW50KCkuZmluZCgnLnN3aXBlci1jb250YWluZXInKVswXS5zd2lwZXIuc2xpZGVQcmV2KClcbiAgICAkKCcjYWNjb3JkaW9uIC5mYS1hbmdsZS1yaWdodCcpLm9uICdjbGljaycsIChlKS0+XG4gICAgICAkKEApLnBhcmVudCgpLnBhcmVudCgpLmZpbmQoJy5zd2lwZXItY29udGFpbmVyJylbMF0uc3dpcGVyLnNsaWRlTmV4dCgpXG4jICAgICQoJyNhY2NvcmRpb24gLnBhbmVsLWhlYWRpbmcnKS5vbiAnY2xpY2snLCAoZSktPlxuIyAgICAgIGNvbnNvbGUubG9nKCQoQCkuZmluZCgnYScpKVxuIyMgICAgICAkKEApLmZpbmQoJ2EnKS50cmlnZ2VySGFuZGxlcignY2xpY2snKVxuI2VuZHJlZ2lvblxuXG4jcmVnaW9uICAgQ2xpZW50cyBjYXJvdXNlbFxuICAgIHN3aXBlckNhcm91c2VsID0gbmV3IFN3aXBlcignLnN3aXBlci1jYXJvdXNlbCcsIHtcbiAgICAgIGxvb3A6IHRydWVcbiAgICAgIG5leHRCdXR0b246ICAnI2J0bkNsaWVudHMgLnN3aXBlci1idXR0b24tbmV4dCdcbiAgICAgIHByZXZCdXR0b246ICcjYnRuQ2xpZW50cyAuc3dpcGVyLWJ1dHRvbi1wcmV2J1xuICAgICAgc2xpZGVzUGVyVmlldzogNFxuICAgICAgc2xpZGVzUGVyR3JvdXA6IDRcbiAgICAgIHBhZ2luYXRpb25DbGlja2FibGU6IHRydWVcbiAgICAgIHNwYWNlQmV0d2VlbjogMjBcbiAgICB9KVxuI2VuZHJlZ2lvblxuXG4jcmVnaW9uICAgZm9vZCB0YWJzXG4gICAgJChcIiNmb29kIC5uYXYtYnRucy1tZW51IGFcIikuY2xpY2soKGUpLT5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgJChAKS5wYXJlbnQoKS5maW5kKCdhJykucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgICQoQCkuYWRkQ2xhc3MoJ3NlbGVjdGVkJylcbiAgICAgICQodGhpcykudGFiKCdzaG93JylcbiAgICApXG4gICAgJCgnI2Zvb2QgLm5hdi1idG5zLXBlcnNvbiBhJykuY2xpY2soKGUpLT5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgJChAKS5jbG9zZXN0KCcudGFiLXBhbmUnKS5maW5kKCcubmF2LWJ0bnMtcGVyc29uIGEnKS5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgJChAKS5hZGRDbGFzcygnc2VsZWN0ZWQnKVxuICAgICAgJChAKS5jbG9zZXN0KCcudGFiLXBhbmUnKS5maW5kKCcubmF2LWJ0bnMtcGVyc29uIGFbaHJlZj1cIicrJChAKS5hdHRyKCdocmVmJykrJ1wiXScpLmFkZENsYXNzKCdzZWxlY3RlZCcpXG4gICAgICAkKHRoaXMpLnRhYignc2hvdycpXG4gICAgKVxuICAgICQoJyNmb29kIC5uYXYtYnRucy1wZXJzb246aGlkZGVuIGE6bnRoLWNoaWxkKDEpJykuY2xpY2soKVxuICAgICQoJyNmb29kIC5uYXYtYnRucy1tZW51IGE6Zmlyc3QnKS5jbGljaygpXG5cbiAgICAkKCcjZm9vZCAudGFibGUnKS5lYWNoKCgpLT5cbiAgICAgICQoJ3RyLnRkJykuZmlsdGVyKCc6b2RkJykuYWRkQ2xhc3MoJ2V2ZW4nKVxuI2VuZHJlZ2lvblxuXG4gIClcbikgalF1ZXJ5XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=