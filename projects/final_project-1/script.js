ymaps.ready(init);

let map = document.querySelector('#map');
let geoObjects = [];
let storage = localStorage;


let index = storage.length || '0';


    


/// Массив для хранения информации о плейсмарках
let placemarks = [];

function init() {
  ///Центр карты
  let placemark,
  myMap = new ymaps.Map('map', {
    center: [55.753994, 37.622093],
    zoom: 12
  }, {
    searchControlProvider: 'yandex#search'
  });
  ///Кластер
  let clusterer = new ymaps.Clusterer({
    preset: 'islands#invertedVioletClusterIcons',
    groupByCoordinates: true,
    clusterDisableClickZoom: true,
    clusterOpenBalloonOnClick: false,
  });
  ///Клик по кластеру
  clusterer.events.add('click', event => {
    let coords = event.get('target').geometry.getCoordinates();
    baloon.openBaloon(coords)
  })



  myMap.geoObjects.add(clusterer);
  ///Карта на весь экран
  var fullscreenControl = new ymaps.control.FullscreenControl();
  myMap.controls.add(fullscreenControl);
  fullscreenControl.enterFullscreen();


  ///Доступ к конструктору
  let baloon = new Baloon();
  ///Создание меток из LocalStorage
  for(let i = 0; i < storage.length; i++) {
    let returnStorage = JSON.parse(storage[i]);
    baloon.createPlacemark(returnStorage[0]);
  }

  ///Получаем доступ к форме
  let form = document.querySelector('#addForm').innerHTML;


  // Слушаем клик на карте.
  myMap.events.add('click', function (e) {
    let coords = e.get('coords');

    baloon.openBaloon(coords);
    
  });

  document.body.addEventListener('click', event => {
    let target = event.target;
    if (target.dataset.role == 'review-add') {
      let reviewForm = document.querySelector('[data-role=review-form]');
      let coords = JSON.parse(reviewForm.dataset.coords);
      let nameValue = document.querySelector('[data-role=review-name]').value;
      let placeValue = document.querySelector('[data-role=review-place]').value;
      let textValue = document.querySelector('[data-role=review-text]').value;
      try{if(nameValue.length > 0 && placeValue.length > 0 && textValue.length > 0){
      let geoObject = new ymaps.Placemark(coords);
      geoObjects.push(geoObject)
      
      ///index
        storage[index++] = JSON.stringify([
        		coords,
            nameValue,
            placeValue,
            textValue,

        ]);
        baloon.createPlacemark(coords);
      }else{
        throw new Error('Все поля должны быть заполнены');
      }}catch(e){
        alert(e.message);
      }
      baloon.closeBaloon();
    }
  })

  function Baloon() {

    this.openBaloon = function (coords) {
      let newForm = this.createForm(coords, placemarks);
      this.setBaloonContent(newForm.innerHTML);
      myMap.balloon.open(coords, {
        balloonContentHeader: ymaps.geocode(coords, {
          
      }).then(function (res) {
          var newContent = res.geoObjects.get(0) ?
                  res.geoObjects.get(0).properties.get('name') :
                  'Не удалось определить адрес.';

          // Задаем новое содержимое балуна в соответствующее свойство метки.
          placemark.properties.set('balloonContentHeader', newContent);
      }),
        contentBody: newForm.innerHTML
      });
    };

    this.createForm = function (coords, placemarks) {

      let newForm = document.createElement('div');
      newForm.innerHTML = form;
      let reviewAdress = newForm.querySelector('#adress');
      let reviewList = newForm.querySelector('#review-list');
      let reviewForm = newForm.querySelector('[data-role=review-form]');
      reviewForm.dataset.coords = JSON.stringify(coords);
      
      for (let i = 0; i < storage.length; i++) {
        let key = storage.key(i);
        
        let numberOfKey = JSON.parse(storage.getItem(key));
          
        if (String(numberOfKey[0]) == coords) {
        let div = document.createElement('div');
          div.classList.add('review-item');
          div.innerHTML = `
          <div>
            <b>${numberOfKey[1]}</b> [${numberOfKey[2]}]
          </div>
          <div>${numberOfKey[3]}</div>
          `;
          reviewList.append(div);
        }
      }
      return newForm;
    }

    this.createPlacemark = function (coords) {
      let placemark = new ymaps.Placemark(coords);
      placemark.events.add('click', event => {
        let coords = event.get('target').geometry.getCoordinates();
        this.openBaloon(coords)
      })
      myMap.geoObjects.add(placemark);
      clusterer.add(placemark);
    }

    this.closeBaloon = function () {
      myMap.balloon.close()
    }

    this.setBaloonContent = function (content) {
      myMap.balloon.setData(content);
    }

      // ///Получаем координаты
      // this.getAddress = function (coords) {
      //   placemark.properties.set('iconCaption', 'поиск...');
      //   ymaps.geocode(coords).then(function (res) {
      //       var firstGeoObject = res.geoObjects.get(0);
  
      //       placemark.properties
      //           .set({
      //               // Формируем строку с данными об объекте.
      //               iconCaption: [
      //                   // Название населенного пункта или вышестоящее  административно-территориальное образование.
      //                   firstGeoObject.getLocalities().length ? firstGeoObject.getLocalities() :  firstGeoObject.getAdministrativeAreas(),
      //                   // Получаем путь до топонима, если метод вернул null, запрашиваем   наименование здания.
      //                   firstGeoObject.getThoroughfare() || firstGeoObject.getPremise()
      //               ].filter(Boolean).join(', '),
      //               // В качестве контента балуна задаем строку с адресом объекта.
      //               balloonContentHeader: firstGeoObject.getAddressLine()
      //           });
      //   });
      // }

  }
}