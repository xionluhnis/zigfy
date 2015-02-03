/**
 * Image Preloader library
 *
 * @author Alexandre Kaspar <akaspar@mit.edu>
 * @link http://github.com/xionluhnis/img.preloader.js
 * @license MIT
 */

(function($) {

    var imagesCount = 0;
    var available   = 7;
    var priorityMap = {};
    var imgDataMap  = {};
    var timeout     = 0;
    var onLoad = function($img){
        $img.fadeIn();
    };
    var baseID = 1;
    function imgID($img) {
        var dataName = 'img.preload.id';
        var id = $img.data(dataName);
        if(id) return id;
        while(!id){
            id = baseID++;
        }
        $img.data(dataName, id);
        return id;
    }
    function preloadImage(){
        if(imagesCount <= 0){
            return;
        }
        var bestPriority = -1.0/0.0;
        for(var priority in priorityMap){
            if(priority > bestPriority){
                bestPriority = priority;
            }
        }
        var block = priorityMap[bestPriority];
        if(!block){
            console.log('Priority map: %o', priorityMap);
            console.log('bestPriority: ' + bestPriority);
            console.log('imgDataMap: %o', imgDataMap);
            return;
        }
        var $img = block.shift();
        var data = imgDataMap[imgID($img)];
        if(!data){
            console.log('No data for: %s, map: %o / %o', imgID($img), priorityMap, imgDataMap);
        }
        // remove block if empty
        if(block.length <= 0){
            delete priorityMap[bestPriority];
        }
        // delete imgDataMap[imgID($img)];

        // consume image preloading
        var im = new Image();
        var loaded = false;
        im.onload = function(){
            if(loaded) return;
            else loaded = true;
            $img.attr('src', $img.data('src'));
            (data.loaded || onLoad)($img);
            setTimeout(preloadImage, data.timeout || timeout);
        };
        im.src = $img.data('src');
        if(im.complete) im.onload();
        --imagesCount;
        --available;
    }
    function pushImage($img, data){
        if(imgID($img) in imgDataMap){
            console.log('Preloading %o twice!', $img);
            return;
        }
        ++imagesCount;
        var priority = data.priority;
        var block = priorityMap[priority];
        if(!block){
            block = [];
            priorityMap[priority] = block;
        }
        block.push($img);
        imgDataMap[imgID($img)] = data;
        if(available > 0){
            preloadImage();
        }
    }

    function setPriority($img, priority){
        if(imgID($img) in imgDataMap){
            var data = imgDataMap[imgID($img)];
            var oldPriority = data.priority;
            if(priority == oldPriority)
                return;
            var block = priorityMap[oldPriority];
            if(block){
                var idx = block.indexOf($img);
                if(idx >= 0){
                    block.splice(idx, 1);
                }
                if(block.length <= 0){
                    delete priorityMap[oldPriority];
                }
                // put in new block
                block = priorityMap[priority];
                if(!block){
                    block = [];
                    priorityMap[priority] = block;
                }
                block.push($img);
                data.priority = priority;
            }
        }
    }

    function initImage($img) {
        if($img.attr('src') && $img[0].complete){
            return;
        }
        $img.hide();
        if($img.attr('src')){
            $img.data('src', $img.attr('src'));
            $img.attr('src', '');
        }
    }

    $.fn.preload = function(action, param){
        if(parseFloat(action) == action){
            action = parseFloat(action);
        }
        if(typeof action == 'string'){
            // preload('action', params);
            switch(action){
                case 'priority':
                    this.each(function(){
                        setPriority($(this), param);
                    });
                    break;
                case 'timeout':
                    timeout = param;
                    break;
                case 'loaded':
                    onLoad = param || onLoad;
                    break;
                case 'init':
                    console.log('init');
                    this.each(function(){
                        initImage($(this));
                    });
                    break;
                default:
                    break;
            }
        } else {
            var data;
            if(typeof action == 'object'){
                data = $.extend({}, $.fn.defaults, action);
            } else if(typeof action == 'number') {
                data = $.extend({}, $.fn.defaults, {priority: action});
            } else {
                data = $.extend({}, $.fn.defaults, {});
            }
            var blocked = available;
            available = 0;
            this.each(function(){
                var $img = $(this);
                if($img.attr('src') && $img[0].complete){
                    (data.loaded || onLoad)($img);
                    return; // no need to push
                }
                initImage($img);
                pushImage($img, data);
            });
            available = blocked;
            for(var i = 0; i < blocked; ++i){
                preloadImage();
            }
        }
    }

    $.fn.defaults = {
        priority: 0
    };
    return this;
})(jQuery);

