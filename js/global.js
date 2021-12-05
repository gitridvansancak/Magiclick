/* Global.JS */

/* Piyasalar listesi */
const exchangeList = [{
		short: "USD",
		long: "Amerikan Doları"
	},
	{
		short: "EUR",
		long: "Avrupa Para Birimi"
	},
	{
		short: "JPY",
		long: "Japon Yeni"
	},
	{
		short: "GBP",
		long: "İngiliz Sterlini"
	},
	{
		short: "DKK",
		long: "Danimarka Kronu"
	},
	{
		short: "NOK",
		long: "Norveç Kronu"
	},
	/*{
		short: "AZN",
		long: "Azerbaycan Manatı"
	},
	{
		short: "BGN",
		long: "Bulgar Rublesi"
	}*/
];

// Nesneye(exchangeList) yeni eklenen para biriminin bayrağı dizinde yok ise default.png
function imgError(image) {
	image.onerror = "";
	image.src = "img/flags/DEFAULT.png";
	return true;
}

/* Piyasalar ve döviz çevirici html oluşturma. */
var xhr = [], i;
// For ile nesne(exchangeList) içindeki birimler dönülüyor. 
for(i = 0; i < exchangeList.length; i++){
	(function(i){
		// Dönen birimlerin TL karşılığı sorguyla getiriliyor. 
		xhr[i] = new XMLHttpRequest();
		url = "https://api.exchangerate.host/latest?base="+exchangeList[i].short+"&symbols=TRY";
		xhr[i].open("GET", url, true);
		xhr[i].onreadystatechange = function(){
			if (xhr[i].readyState === 4 && xhr[i].status === 200){
				// IE11de cevap nesne olarak değil string olarak geliyor. Genel çözüm olarak string içindeki para birimi bulunup noktalar siliniyor.
				var responseTry = xhr[i].responseText.split(/[: ]+/).pop().slice(0, -2).toString().slice(0, -4);
				// Sıralamayı nesnedekiyle(exchangeList) aynı yapmak için tüm itemlere index attr ekleniyor 
				var index = i;
				// Para birimi ülke bayrağı
				var flagSrc = "img/flags/"+exchangeList[i].short+".png"
				// Piyasalar itemları oluşturulup htmle ekleniyor 
				listHtml = '<div class="col-md-6 col-sm-6 col-xs-12 item-exchange" order="'+index+'"> <div class="exc-item"> <div class="row"> <div class="exc-flag col-md-2 col-sm-2 col-xs-2"> <img src="'+flagSrc+'" onerror="imgError(this);" alt="'+exchangeList[i].short+'"> </div> <div class="exc-type col-md-4 col-sm-4 col-xs-4"> <p>'+exchangeList[i].short+'</p> <span>'+exchangeList[i].long+'</span> </div> <div class="exc-buy col-md-3 col-sm-3 col-xs-3"> <p>ALIŞ</p> <span>'+responseTry+'</span> </div> <div class="exc-sell col-md-3 col-sm-3 col-xs-3"> <p>SATIŞ</p> <span>'+responseTry+'</span> </div> </div> </div> </div>';
				$('#itemListContent').append(listHtml);
				// Select optionları nesneden(exchangeList) ekleniyor  
				$('#exc-select').append($('<option>', {
					value: exchangeList[i].short,
					text: exchangeList[i].short,
					order: index
				}));
				// Sıralama attirubete eklenen indexe göre düzeltiliyor 
				getSorted = function(selector, attrName) {
					return $(
						$(selector).toArray().sort(function(a, b){
							var aVal = parseInt(a.getAttribute(attrName)),
								bVal = parseInt(b.getAttribute(attrName));
							return aVal - bVal;
						})
					);
				};
				// Düzeltilen sıralama htmle tekrar ekleniyor
				$sortedItems = getSorted('#itemListContent .item-exchange', 'order').clone();
				$sortedOption = getSorted('#exc-select option', 'order').clone();
				$('#itemListContent').html( $sortedItems );
				$('#exc-select').html( $sortedOption );

				// Optionların sırası değiştiği için güncelleniyor
				$('select').niceSelect('update');
			}
		};
		xhr[i].send();
	})(i);
}

/* Form döviz çevirici fonksiyonu */
var getExchange = function(money){
	// Para birimindeki noktalar kaldırılıyor
	var valueMoney = parseInt($("#money").val().replace(/\./g,""));
	var valueMoneySym = $("select").val();
	// Seçili para birimine göre güncel fiyat çekiliyor
	(function(i){
		xhr[i] = new XMLHttpRequest();
		url = "https://api.exchangerate.host/latest?base="+valueMoneySym+"&symbols=TRY";
		xhr[i].open("GET", url, true);
		xhr[i].onreadystatechange = function(){
			if (xhr[i].readyState === 4 && xhr[i].status === 200){
				// IE11de cevap nesne olarak değil string olarak geliyor. Genel çözüm olarak string içindeki para birimi bulunup noktalar siliniyor.
				var roundPrice = xhr[i].responseText.split(/[: ]+/).pop().slice(0, -2);
				var roundPrice = parseInt(roundPrice.toString().replace(/\./g,""));
				// Girilen miktar ile TRY çarpılıyor
				var responseMoney = valueMoney * roundPrice;
				// ParseInt kullanıldığında Japon para biriminde baştaki 0 silindiği için tekrar ekleniyor.
				if(valueMoneySym=="JPY" & responseMoney.toString().length < 7){
					responseMoney = "0"+responseMoney;
				// Para birimi rakam farkı nedeniyle Danimarka para biriminin sonuna bir rakam ekleniyor. 
				}else if(valueMoneySym=="DKK"){
					responseMoney = responseMoney+"0";
				}
				// Sonucun sonundaki küsürat siliniyor
				responseMoney = responseMoney.toString().slice(0, -4);
				// input mask tekrar oluşması için input tetikleniyor
				$('#response-money').val(responseMoney).trigger('input');
				return responseMoney;
			};
		}
		xhr[i].send();
	})(i);
}

/* Para birimi değişimi */
$('select').on('change', function() {
	var money = $("#money").val();
	getExchange(money);
	$("#response-money").val(money);
});

/* Girilen miktarı çevirme */
$("#money").keyup(function(){
	var money = $("#money").val();
	getExchange(money);
	$("#response-money").val(money);
});

$(document).ready(function() {
	/* niceselect */
	$('select').niceSelect();
	/* inputmask */
	$('.mask-money').mask('#.##0', {reverse: true});
	$(".mask-money-response").mask('#.##0,00', {reverse: true});
}); 







