## Фронтенд

Использование


```html
<body>
	<script src="faint.js"></script>
	<div id="content">
		Загружаем...
	</div>
</body>
```

```js
FAINT.init({
	bundle: {
		base_url: 'templates',
	},

	bootstrap: {
		template: 'main',
		data: {hello: 'world'}
	},

	pligins: {

	}
});

```

## Плагины

### Шина событий

Отправка

```js
FAINT.ev(['key', 'subkey'], data);
FAINT.ev('key::subkey', data); 	// the same
```

Подписка

```js
FAINT.ev.on(['key', 'subkey'], function(data) {
   // обработка события key::subkey
});
```


### Семафоры/блокировки

Они всегда именованные.

Использование

```js
FAINT.semaphore(name)
     .then(function(done) {
	// что-то делаем

	done();
     });
```

Создание:

```js

// при инициализации
FAINT.init({
	semaphore: {
		lock1: 10,
		abc: 1
	}
});

// или так
FAINT.semaphore.create('name', 11);
```

### Ajax

Умеет блокировки (очереди) и повторы.

```js
FAINT.ajax({url: url, type: 'POST', data: {a:'b'})
     .then(function(data) {
	//...
     })
     .catch(function(error) {
	//...
     });
```

Под капотом перевызывает jQuery.ajax, но не принимает функции `complete`,
`success`, `error` (игнорирует их простановку), а так же принимает доппараметры:

- `queue` - если передана строка, то использует очередь с таким именем.
Два запроса с одинаковым значением `queue` не будут выполнены одновременно
(кроме неопределенных значений `queue`).

```js
FAINT.ajax({url: url1, queue: 'gps', data: geopos, type: 'POST'})
     .then(function(data) {

     });

FAINT.ajax({url: url2, queue: 'gps', data: geopos, type: 'POST'})
     .then(function(data) {

     });
```

Данный пример отправляет координаты по двум урлам и гарантирует что
одновременно в два урла не будет выполняться запросов.

- `repeat` - правило повторов.

Здесь передается имя правила повторов.

Сами правила описываются при инициализации плагина:

```js
FAINT.init({
	ajax: {
		repeats: {
			gps: {
				intervals: [1, 2, 4, 8],
				after: [ /5../ ],
				forever: true
			}
		}
	}
})
```

Вышеприведенный пример будет бесконечно повторять запрос после пятисоток
(сетевые ошибки приравниваются к кодам 595, 596), первый повтор будет
выполнен через секунду, второй - через две, четвертый и остальные - через
8 секунд.

Eсли `forever==false` то повторов будет ровно столько сколько указано
и после последнего будет возвращена ошибка.

