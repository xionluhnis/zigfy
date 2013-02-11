// zigfy, Z Image Gallery plugin for JQuery
// version 0.2
// (c) 2013 Alexandre Kaspar [xion.luhnis@gmail.com]
// released under the MIT license

(function ($) {

  // the available image transitions
  var transitions = {
    /**
     * Alpha transition
     */
    fade: {
      init: function ( /* length */ ) {},
      before: function () {},
      after: function () {
        var self = this;
        self.$el.scrollTop(0);
        for (var i = 0; i < self.images.length; ++i) {
          var $img = self.images[i];
          // fade animation
          if (i === self.index) $img.stop().fadeIn(500);
          else $img.stop().fadeOut(500);
        }
      }
    },
    /**
     * Exposure from white
     */
    flash: {
      init: function ( /* length */ ) {},
      before: function () {
        var self = this;
        // we add the white cover
        if (self.lastIndex !== -1 && self.isLoaded(self.lastIndex)) {
          self.$cover.addClass('zigfy-flash').show();
        }
        // hide all images first
        for (var i = 0; i < self.images.length; ++i) self.images[i].hide();
      },
      after: function () {
        var self = this;
        // show current image (behind white cover)
        self.images[self.index].show();
        // we fade out the white cover
        self.$cover.fadeOut(500, function () {
          self.$cover.removeClass('zigfy-flash');
        });
      }
    }
    // end of transitions
  };

  function Zigfy(element, options) {
    var self = this;
    var $el = this.$el = $(element);
    this.options = options;
    // we force-set the zigfy class
    if(!options.noClass) $el.addClass('zigfy');
    // loading class
    $el.addClass('zigfy-loading');
    // we want an event namespace for this object
    var eNS = this.__eventNS = options.eventNamespace === null ?  '.zigfy-' + Math.random() : options.eventNamespace;

    // finding the images
    var $imgs;
    if (options.imgSelector) {
      $imgs = $(options.imgSelector);
    } else {
      $imgs = $el.find('img');
    }
    // current index
    self.index = 0;
    self.lastIndex = -1;

    // layout
    var layout;
    if (typeof options.layout == 'function') layout = options.layout;
    else layout = self[options.layout + 'Layout'] || self.maximizeLayout;
    self.layout = layout.bind(self);

    // alignment
    if (['topleft', 'top', 'topright', 'left', 'center', 'right', 'bottomleft', 'bottom', 'bottomright'].indexOf(options.align) === -1) {
      options.align = 'topleft';
    }
    var align = options.align;
    self.alignX = align.indexOf('left') !== -1 ? -1 : (align.indexOf('right') !== -1 ? 1 : 0);
    self.alignY = align.indexOf('top') !== -1 ? -1 : (align.indexOf('bottom') !== -1 ? 1 : 0);

    // general cover layer
    self.$cover = $('<div />').css({
      'display': 'none',
      'z-index': $imgs.length + 3
    }).addClass('zigfy-cover');

    // init transition
    var trans;
    if (typeof options.transition == 'object') {
      trans = options.transition;
      if (!trans.init) trans.init = function () {};
      if (!trans.before) trans.before = function () {};
      if (!trans.after) trans.after = function () {};
    } else {
      trans = transitions[options.transition] || transitions.fade;
    }
    self.transition = trans;
    trans.init.call(self, $imgs.length);

    // populating the gallery
    var images = self.images = [];
    var loaded = self.loaded = {};
    var dims = self.dims = {};
    $el.children().remove();
    $imgs.each(function () {
      var $origImg = $(this);
      var index = images.length;
      // pre-init stuff
      if (index === self.index) self.preInit();

      // image creation
      var $img = $('<img />').data('index', index).css({
        'display': 'none', // we only show the first one by default
        'height': 'auto',
        'width': 'auto',
        'z-index': index + 1
      }).attr('src', $origImg.attr('src'));
      images.push($img);

      // image loading
      var onLoad = function () {
        loaded[index] = true;
        dims[index] = {
          height: $img.height(),
          width: $img.width()
        };
        // mapMode = map navigation on click
        if (options.mapMode) {
          $img.on('click' + eNS, function (e) {
            e.preventDefault();
            self.toggleNavigation();
          });
        }

        // are we the target image?
        if (index === self.index) {
          // we can update the layout
          self.layout();
          // and do the post-init stuff
          self.postInit();
        }

        // done loading
      };
      // onLoad hook
      if (self.isLoaded(index)) onLoad();
      else $img.load(onLoad);

      // image in the DOM
      $el.append($img);
    });

    // navigation
    if (options.showNav && images.length > 1) {
      // images are from z-index = 1 to images.length
      // => prev: images.length + 1
      this.navPrev = $('<div class="zigfy-prev" />').css('z-index', images.length + 1).on('click' + eNS, function () {
        self.prev();
      }).appendTo($el);
      // => next: images.length + 2
      this.navNext = $('<div class="zigfy-next" />').css('z-index', images.length + 2).on('click' + eNS, function () {
        self.next();
      }).appendTo($el);
    }
    // mapMode
    if (options.mapMode) $el.append(self.$cover);

    // events
    if (options.resize) {
      $(window).on('resize' + eNS, function () {
        self.layout();
      });
    }
  }

  Zigfy.prototype = {

    /**
     * Global listener clear function
     */
    clear: function(){
      var eNS = this.__eventNS;
      if(!eNS) return;
      $(window).off('resize' + eNS);
      if(this.navPrev) this.navPrev.off('click' + eNS);
      if(this.navNext) this.navNext.off('click' + eNS);
      $(this.images).each(function(){
        $(this).off('click' + eNS);
      });
      var $cover = this.$cover;
      if($cover){
        $cover.off('click' + eNS).off('mousemove' + eNS);
      }
    },

    /**
     * Loaded check
     */
    isLoaded: function (index) {
      var self = this;
      if (index === undefined) index = self.index;

      // the normal way
      if ( !! self.loaded[index]) return true;

      // the hack way for other cases (cache, error)
      var $img = self.images[index];
      return $img.readyState || $img.complete;
    },

    /**
     * Maximize layout which stretches
     * the smallest ratio to fit 100%
     * @param $cnt the container
     * @param $img the image to lay out
     */
    maximizeLayout: function () {
      var self = this;
      // the container
      var $cnt = self.$el;
      // the image
      var $img = self.images[self.index];

      // if there is no image, it's done
      if (!$img || !self.isLoaded()) return;

      // we check whether it's not big enough
      var W = $cnt.width();
      var H = $cnt.height();

      // default css
      // Note: we only use top/left, not right/bottom!
      $img.css({
        'border': 0,
        'margin': 0,
        'position': 'absolute',
        'height': 'auto',
        'width': 'auto'
      });

      // the ratios
      var d = self.dims[self.index];
      var fx = d.width / W;
      var fy = d.height / H;
      if (fx < 1) {
        if (fy < 1) {
          // both w/h too small
          // => we stretch the smallest ratio to 100%
          // => full area will be covered
          if (fx > fy) {
            $img.css('height', H); // 100%
          } else {
            $img.css('width', W);
          }
        } else {
          // only w too small
          $img.css('width', W);
        }
      } else {
        // width is ok
        if (fy < 1) {
          // only h too small
          $img.css('height', H);
        } else {
          // both w/h ok
          // => we stretch the smallest ratio to 100%
          if (fx > fy) {
            $img.css('height', H);
          } else {
            $img.css('width', W);
          }
        }
      }

      // the new image dimensions
      var w = $img.width();
      var h = $img.height();

      // alignment X
      var left;
      switch (self.alignX) {
        case -1:
          left = 0;
          break;
        case 0:
          left = Math.floor((W - w) / 2);
          break;
        case 1:
          left = W - w;
          break;
      }
      $img.css('left', left);
      // alignment Y
      var top;
      switch (self.alignY) {
        case -1:
          top = 0;
          break;
        case 0:
          top = Math.floor((H - h) / 2);
          break;
        case 1:
          top = H - h;
          break;
      }
      $img.css('top', top);
    },

    /**
     * Special layout for the panel
     * which fits the image in the remaining
     * available space using the same
     * rules as the custom layout
     */
    fullLayout: function () {
      var self = this;
      var $cnt = self.$el;
      var $img = self.images[self.index];

      // we need an image to lay out
      if (!$img || !self.isLoaded()) return;

      // dimensions
      var d = self.dims[self.index];
      var w = d.width;
      var h = d.height;
      var W = $cnt.width();
      var H = $cnt.height();
      var padding = self.options.padding || 0;

      // we use the ratios
      var b = function (what) {
        return parseInt($img.css('border-' + what + '-width').replace('px', ''), 10);
      };
      var horizPad = 2 * padding + b('left') + b('right');
      var vertiPad = 2 * padding + b('top') + b('bottom');
      var fx = w / (W - horizPad);
      var fy = h / (H - vertiPad);

      // defaults
      $img.css({
        'position': 'absolute',
        'height': 'auto',
        'width': 'auto',
        'top': 0,
        'left': 0,
        'margin': 0
      });

      /**
       * Invariant :
       *  the aspect ratio w/h = ( W - horizPad )/( H - vertiPad )
       */

      // XXX take alignX and alignY into consideration...
      // checking ratios
      if (fx < 1) {
        // w too small
        // we need to center the whole image
        if (fy < 1) { // h too small too
          // centering vertically
          $img.css('height', H - vertiPad);
          $img.css('top', padding + (H - h) / 2);
          $img.css('width', W - horizPad);
          $img.css('left', padding + (W - w / fy) / 2 - b('left'));
        } else { // h ok
          $img.css('height', H - vertiPad);
          $img.css('top', padding);
          $img.css('width', w / fy);
          $img.css('left', padding + (W - w / fy) / 2 - b('left'));
        }
      } else {
        // w ok, we shrink ratio
        var FY = fy / fx;
        if (FY < 1) { // h too small now
          $img.css('width', w / fx);
          $img.css('left', padding);
          $img.css('height', h / fx);
          $img.css('top', (H - h / fx) / 2 - b('top'));
        } else {
          // we shrink w since h / fx is fine
          $img.css('height', H - vertiPad);
          $img.css('top', padding);
          $img.css('width', w / fy);
          $img.css('left', (W - w / fy) / 2 - b('left'));
        }
      }
    },

    preInit: function () {
      this.$el.addClass('zigfy-loading');
      this.transition.before.call(this, this.index, this.lastIndex);
    },

    postInit: function () {
      this.transition.after.call(this, this.index, this.lastIndex);
      this.$el.removeClass('zigfy-loading').addClass('zigfy-loaded');
    },

    prev: function () {
      var self = this;
      var i = self.lastIndex = self.index;
      self.index = i <= 0 ? self.images.length - 1 : i - 1;
      self.preInit();
      self.layout();
      if (self.isLoaded(self.index)) self.postInit();
    },

    next: function () {
      var self = this;
      var i = self.lastIndex = self.index;
      self.index = i >= self.images.length - 1 ? 0 : i + 1;
      self.preInit();
      self.layout();
      if (self.isLoaded(self.index)) self.postInit();
    },

    /**
     * Toggle the maps navigation
     */
    toggleNavigation: function () {
      var self = this;
      var eNS = this.__eventNS;
      var $cover = self.$cover;
      // current mode?
      if (self.mapMode) {
        // we hide the cover
        $cover.stop().fadeOut(500, function () {
          $cover.removeClass('zigfy-maps');
        });

        // and stop the navigation
        $cover.off('mousemove' + eNS);
        $cover.off('click' + eNS);
      } else {
        // we set the click back
        $cover.on('click' + eNS, self.toggleNavigation.bind(self));
        // we show the cover
        $cover.addClass('zigfy-maps').stop().fadeIn(500);
        $cover.css('cursor', 'move');
        // and bind the navigation event
        $cover.on('mousemove' + eNS, self.navigate.bind(self));
      }

      // we switch the mode
      self.mapMode = !self.mapMode;
    },

    distF: function (t) { // easeInOutCubic
      // t in [0;1];
      if ((t *= 2) < 1) { // t in [0;0.5]*2
        return t * t * t / 2;
      }
      // t in [1;2]
      t -= 2; // t in [-1;0]
      return (t * t * t + 2) / 2;
    },

    navigate: function (e) {
      var self = this;
      var $cnt = self.$el;
      var W = $cnt.width();
      var H = $cnt.height();
      var $img = self.images[self.index];
      var w = $img.width();
      var h = $img.height();
      var range, scroll;

      // the gap in y
      if (h > H) {
        var fy = e.pageY / H;
        range = h - H;
        scroll = range * self.distF(fy);
        $img.css('top', -scroll);
      }
      // the gap in x
      if (w > W) {
        var fx = e.pageX / W;
        range = w - W;
        scroll = range * self.distF(fx);
        $img.css('left', -scroll);
      }
    }

  };

  // the zigfy JQuery function
  $.fn.zigfy = function (options) {

    if (options === true) {
      return this.data('zigfy');
    } else if (typeof options == 'string') {
      var zigfy = this.data('zigfy');
      if (zigfy) zigfy[options]();
      return this;
    }

    options = $.extend({}, $.fn.zigfy.defaults, options);

    // HTML data options
    var $el = this;
    for(var key in $.fn.zigfy.defaults){
      var val = $el.data('zigfy-' + key);
      if(val !== undefined){
        switch(typeof $.fn.zigfy.defaults[key]){
          case 'boolean':
            options[key] = $.parseJSON(val.toString());
            break;
          case 'number':
            options[key] = parseInt(val.toString(), 10);
            break;
          default:
            options[key] = val.toString();
        }
      }
    }


    function get(ele) {
      var zigfy = $.data(ele, 'zigfy');
      if (!zigfy) {
        zigfy = new Zigfy(ele, $.fn.zigfy.elementOptions(ele, options));
        $.data(ele, 'zigfy', zigfy);
      }
      return zigfy;
    }

    this.each(function () {
      get(this);
    });

    return this;
  };

  $.fn.zigfy.defaults = {
    resize: false, // whether to respond to resize events automatically
    layout: 'maximize', // or 'full' to show the full picture, in reduced size
    align: 'center', // or 'topleft', 'top', 'topright', 'left', 'right', 'bottomleft', 'bottom', 'bottomright'
    transition: 'fade', // or 'flash', or {init, before, after}
    showNav: true, // for the left / right navigation buttons
    autoNav: false, // whether to have automatic navigation
    autoNavBar: false, // whether to show a countdown navigation bar (only when autoNav == true
    autoNavDuration: 5000, // timing for autoNav == true
    padding: 10, // to override CSS padding in 'full' mode, not used in 'zoom' mode
    mapMode: true, // whether to enable clicking to grab and see more, only for the 'zoom' mode
    imgSelector: null, // the image selector (null => img in HTML target)
    noClass: false, // disable .zigfy CSS class auto-added to base element
    eventNamespace: null // event namespace to use (by default a randomly generated .zigfy-{random} one
  };

  // Overwrite this method to provide options on a per-element basis.
  // For example, you could store the gravity in a 'zigfy-gravity' attribute:
  // return $.extend({}, options, {gravity: $(ele).attr('zigfy-gravity') || 'n' });
  // (remember - do not modify 'options' in place!)
  $.fn.zigfy.elementOptions = function (ele, options) {
    return $.metadata ? $.extend({}, options, $(ele).metadata()) : options;
  };

  //
  // Apply on elements with class .zigfy
  //
  $(function () {
    $('.zigfy').zigfy();
  });

})(jQuery);
