// ==UserScript==
// @name         BetterP
// @version      0.1
// @author       Nia
// @match        *://blog.csdn.net/*/article/details/*
// @match        *://www.bilibili.com/read/*/
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {


    function log(msg) {
        console.log(`[Better P] ${msg}`)
    }

    class Context {
        constructor() {
            this.supports = {
                "bilibli": "bilibli",
                "csdn": "csdn"
            }
            this.current_url = window.location.href
            this.handlers = {}
            if (this.current_url.includes("blog.csdn.net")) {
                this.brand = this.supports.csdn
            } else if (this.current_url.includes("www.bilibili.com")) {
                this.brand = this.supports.bilibli
            }
        }
    }

    Context.prototype.is_bilibli = function () {
        return this.brand === this.supports.bilibli
    }

    Context.prototype.is_csdn = function () {
        return this.brand === this.supports.bilibli
    }

    Context.prototype.add_handler = function (brand, handler) {
        if (!this.handlers[this.brand]) this.handlers[this.brand] = []
        this.handlers[this.brand].push(handler)
    }

    class Init extends Context {
        constructor() {
            super()
            this.__before_ajax_send_hanlders = []
            this.__element_event_cache = new Map()
            let self = this
            const __send = XMLHttpRequest.prototype.send
            const __open = XMLHttpRequest.prototype.open
            const __fetch = fetch
            const __addEvnentListner = HTMLElement.prototype.addEventListener

            XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
                this.__url = url
                return __open.apply(this, arguments)
            }

            XMLHttpRequest.prototype.send = function (data) {
                for (let index in self.__before_ajax_send_hanlders) {
                    let before_ajax_send_handler = self.__before_ajax_send_hanlders[index]
                    if (!before_ajax_send_handler.apply(this, this.__url, data)) {
                        return null
                    }
                }
                return __send.apply(this, arguments)
            }

            if (__fetch) {
                fetch = function (input, init) {
                    for (let index in self.__before_ajax_send_hanlders) {
                        let before_ajax_send_handler = self.__before_ajax_send_hanlders[index]
                        if (!before_ajax_send_handler.apply(this, input, init)) {
                            return {
                                then() {},
                                catch () {},
                                finally() {}
                            }
                        }
                    }
                    return __fetch.apply(this, arguments)
                }
            }

            HTMLElement.prototype.addEventListener = function (type, listener, options) {
                let element_key_event_map = self.__element_event_cache.get(this)
                if (!element_key_event_map) {
                    self.__element_event_cache.set(this, (element_key_event_map = {}))
                }
                if (!element_key_event_map[type]) {
                    element_key_event_map[type] = new Set()
                }
                element_key_event_map[type].add(listener)
                return __addEvnentListner.apply(this, arguments)
            }
        }
    }


    Init.prototype.selectable = function (selector) {
        document.querySelectorAll(selector).forEach(ele => {
            ele.style['-webkit-user-select'] = 'text';
            ele.style['-khtml-user-select'] = 'text';
            ele.style['-moz-user-select'] = 'text';
            ele.style['-ms-user-select'] = 'text';
            ele.style['user-select'] = 'text';
        })
    }

    Init.prototype.delete = function (selector) {
        document.querySelectorAll(selector).forEach(ele => {
            ele.remove()
        })
    }

    Init.prototype.add_before_send_handler = function (handler) {
        this.__before_ajax_send_hanlders.push(handler)
    }


    Init.prototype.drop_event = function (selector, event_type) {
        document.querySelectorAll(selector).forEach(ele => {
            let ele_cache = this.__element_event_cache.get(ele)
            if (!ele_cache) return
            let listener_cache = ele_cache[event_type]
            if (!listener_cache) return
            listener_cache.forEach(handler => {
                ele.removeEventListener(event_type, handler)
            })
        })
    }

    Init.prototype.click = function (selector) {
        document.querySelectorAll(selector).forEach(e => e.click())
    }

    Init.prototype.drop_copy = function (selector) {
        this.drop_event(selector, "copy")
    }


    let context = new Init()
    window.addEventListener("load", function () {
        if(!context.handlers) return
        for (let key in context.handlers) {
            log(`开始处理${key}页面优化`)
            if (context.handlers[key]) {
                context.handlers[key].forEach(handler => handler.apply(context))
            }
        }
    });

    context.add_handler(context.supports.bilibli, function () {
        this.drop_copy("#article-content");
    })

    context.add_handler(context.supports.csdn, function () {
        this.selectable("#content_views pre")
        this.selectable("#content_views pre code")
        this.selectable("#content_views > pre")
        this.drop_copy("#content_views")
        this.delete('#content_views .hljs-button.signin')
        this.click("#content_views > pre > div.hide-preCode-box > span")
        this.click("#tool-active-list-close")
    })
})()