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
