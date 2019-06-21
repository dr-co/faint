# Шаблонизатор низкий уровень

```js

ejst('my-template', 'Hello <%= str %>', {str: 'world'})
    .then(function(html) { $('#dom').html(html); })
    .catch(function(error) { console.error(error); });

```
