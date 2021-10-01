// Import bibliotek i frameworku
const express = require('express') // Framework
const app = express()
const bodyParser = require('body-parser') // import bibliotki, pozwalającej na pobieranie wartości z ciała zapytania HTTP
const dbConnection = require('./database') // import modułu połączenia z bazą danych
const path = require('path') // import ścieżki
const ejs = require('ejs') // import silnika wyświetlania plików

// Silnik
app.use(express.urlencoded({extended:false}));
app.use(bodyParser.json()); 
// Określenie ścieżki plików css/js/zdjęć (frontend)
app.use(express.static('public')); 
app.use(express.static(__dirname + '/public'));
// Określenie ścieżki plików statycznych (html), oraz zmiana silnika wyświetlania plików na EJS (https://ejs.co/)
app.set('views', path.join(__dirname,'views'));
app.set('view engine','ejs');

// Definicja, oraz wyświetlenie strony głównej
app.get('/', (req, res) => {
    res.render('index')
})

// Definicja, oraz konfiguracja endpointu do obliczania ceny brutto
app.post('/oblicz', (req, res) => {
    var {produkt, cena} = req.body // Pobranie wartości z ciała zapytania
    var cenaInt = parseFloat(cena) // Zmiana wartości ze string na float
    dbConnection.execute("SELECT `stawka` FROM `produkty` WHERE `nazwa`=?",[produkt]) // Wykonanie zapytania na bazie danych
    .then(([rows]) => {
        if(rows.length == 1){ // Warunek sprawdzający ilość zwróconych wierszy
            var vat = cenaInt * rows[0].stawka // Obliczenie VATU
            var wynik = cenaInt + parseFloat(vat.toPrecision(2)) // Obliczenie wyniku (cena + vat)
            res.render('index', { 
                wynik: wynik // Wyrenderowanie strony wraz z wynikiem
            })
        }else{ // Jeżeli liczba wierszy jest równa 0:
            res.render('index', {
                error: "Brak takiego produktu w bazie danych." // Wyrenderowanie strony wraz z komunikatem błędu
            })
        }
    });
})

// Definicja portu, oraz uruchomienie aplikacji
app.listen(3000, () => {
    console.log(`Serwer został uruchomiony: http://localhost:3000/`)
})