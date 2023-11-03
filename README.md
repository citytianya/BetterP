# BetterP

一个页面优化脚本库, 你可以通过这个库做一些简单的页面优化工作。

## betterP.js

提供了一些立即可用的方法。

```

    context.selectable(selector) // 使指定的文本区域可选
    context.delete(selector) // 删除指定的元素
    context.drop_event(selector, event_type) // 解除元素上的事件

```

举例而言，使用:

```
    context.delete("#ads") // 删除某广告元素
```

使用：

```
    context.selectable("#text")
    context.drop_event("#text", "copy") // 使得文本区变得可选 

    // 或

    context.drop_copy("#text") // 同等于 context.drop_event("#text", "copy")
```


## betterP_im.js

这个文件可以直接导入油猴脚本管理器中。

为了在指定页面中生效，需要在首部指定@match标签：

```
// @match        *://blog.csdn.net/*/article/details/*
// @match        *://www.bilibili.com/read/*/
```

在Context.supports中添加你需要的页面ID，如：

```
this.supports = {
                "bilibli": "bilibli",
                "csdn": "csdn"
            }
```

为 brand 赋值，如
```
if (this.current_url.includes("blog.csdn.net")) {
                this.brand = this.supports.csdn
            } else if (this.current_url.includes("www.bilibili.com")) {
                this.brand = this.supports.bilibli
            }
```

最后，在最下方添加对应的处理函数即可。

```
    context.add_handler(context.supports.bilibli, function () {
        this.drop_copy("#article-content");
    })
```

注意，在不特意变更this指向时，this指向context对象。

im版本中，默认优化csdn和bilibli两个detail页。

