const categoryData={
  'wycieczki-1-dniowe':{title:'Wycieczki 1-dniowe',desc:'Gotowe jednodniowe wyjazdy szkolne z transportem, rezerwacjami i pełnym planem dnia.'},
  historia:{title:'Historia i zwiedzanie',desc:'Zamki, pałace, muzea i miasta — programy dopasowane do wieku uczniów.'},
  nauka:{title:'Nauka i odkrywanie',desc:'Centra nauki, planetaria i warsztaty, które łączą wyjazd z odkrywaniem.'},
  zabawa:{title:'Zabawa i atrakcje',desc:'Parki rozrywki, aquaparki, trampoliny i inne wyjazdy pełne dobrej zabawy.'},
  natura:{title:'Natura i przygoda',desc:'Zoo, góry, jaskinie, parki linowe i aktywne wycieczki w naturze.'},
  miasta:{title:'Wycieczki do miast',desc:'Gotowe programy wyjazdów do Warszawy, Krakowa, Łodzi, Wrocławia, Torunia i innych miast.'}
};
const sampleTrips=[
 ['Warszawa — Centrum Nauki Kopernik','Warszawa','1–8','1 dzień','od 189 zł','Eksperymenty • Stare Miasto • spacer'],
 ['Łódź — Orientarium i ZOO','Łódź','1–8','1 dzień','od 159 zł','Orientarium • ZOO • czas na posiłek'],
 ['Toruń — miasto Kopernika','Toruń','2–8','1 dzień','od 199 zł','Planetarium • Stare Miasto • pierniki'],
 ['Warszawa — historia i zwiedzanie','Warszawa','4–8','1 dzień','od 179 zł','Stare Miasto • Łazienki • najważniejsze zabytki'],
 ['Mandoria — dzień pełen zabawy','Rzgów','1–8','1 dzień','od 169 zł','Park rozrywki • atrakcje • transport'],
 ['Góry Świętokrzyskie — przygoda','Świętokrzyskie','3–8','1 dzień','od 219 zł','Szlak • natura • atrakcje regionalne']
];
function renderCategory(key){
 const d=categoryData[key]; if(!d)return;
 const hero=document.querySelector('.hero'); document.querySelector('#intro')?.remove();
 document.body.classList.add('category-page');
 hero.innerHTML=`
 <div class="cat-wrap">
  <a class="back-home" href="/">← Strona główna</a>
  <div class="cat-heading"><div><span class="eyebrow">HEJWYPRAWA.PL • GOTOWE PROGRAMY SZKOLNE</span><h1>${d.title}</h1><p>${d.desc}</p></div><div class="cat-badge">🚌<strong>Pełna organizacja</strong><small>transport • bilety • rezerwacje</small></div></div>
  <form class="trip-filters" id="tripFilters">
   <label>Skąd wyjeżdżacie?<input id="from" placeholder="np. Tomaszów Mazowiecki"></label>
   <label>Klasa / klasy?<div class="grade-picker" id="gradePicker"><button type="button" data-grade="1">1</button><button type="button" data-grade="2">2</button><button type="button" data-grade="3">3</button><button type="button" data-grade="4">4</button><button type="button" data-grade="5">5</button><button type="button" data-grade="6">6</button><button type="button" data-grade="7">7</button><button type="button" data-grade="8">8</button></div></label>
   <label>Liczba uczniów<input id="students" type="number" min="1" placeholder="np. 55"></label>
   <label>Opiekunowie<input id="guardians" type="number" min="0" value="0"></label>
   <label>Budżet / uczeń<input id="budget" type="number" min="1" placeholder="np. 250 zł"></label>
   <button type="submit">POKAŻ WYCIECZKI</button>
   <div class="transport-hint" id="transportHint">🚌 Wpisz liczbę uczniów — podpowiemy, jakiej wielkości transport może być potrzebny.</div>
  </form>
  <div class="results-head"><div><span>GOTOWE WYCIECZKI</span><h2>Wybierz program dla swojej klasy</h2></div><div class="result-count"><b id="count">${sampleTrips.length}</b> propozycji</div></div>
  <div class="trip-grid">${sampleTrips.map((t,i)=>`<article class="trip-card"><div class="trip-photo p${i+1}"><span>${t[1]}</span></div><div class="trip-body"><div class="trip-meta"><span>🎒 ${t[2]}</span><span>🕒 ${t[3]}</span></div><h3>${t[0]}</h3><p>${t[5]}</p><div class="trip-bottom"><div><small>cena za ucznia</small><strong>${t[4]}</strong></div><a href="/wycieczki/${i+1}">ZOBACZ PROGRAM →</a></div></div></article>`).join('')}</div>
  <section class="included"><h2>W każdej wycieczce organizujemy za Was</h2><div><span>🚌 <b>Transport</b><small>dobieramy autokar do grupy</small></span><span>🎟️ <b>Bilety i rezerwacje</b><small>atrakcje zgodnie z programem</small></span><span>🗓️ <b>Harmonogram</b><small>gotowy plan całego dnia</small></span><span>☎️ <b>Organizację</b><small>jedno miejsce kontaktu</small></span></div></section>
 </div>`;
 document.querySelectorAll('#gradePicker button').forEach(btn=>btn.addEventListener('click',()=>btn.classList.toggle('active')));
 const students=document.querySelector('#students'), guardians=document.querySelector('#guardians'), hint=document.querySelector('#transportHint');
 function updateTransport(){
  const u=Number(students.value)||0,g=Number(guardians.value)||0,total=u+g;
  if(!u){hint.textContent='🚌 Wpisz liczbę uczniów — podpowiemy, jakiej wielkości transport może być potrzebny.';return}
  let msg=total<=20?'mały bus / minibus':total<=35?'większy minibus lub mały autokar':total<=55?'jeden autokar':total<=65?'duży autokar lub wariant 2 pojazdów':'najprawdopodobniej 2 autokary';
  hint.innerHTML='🚌 <b>'+u+' uczniów'+(g?' + '+g+' opiekunów':'')+' = '+total+' osób.</b> Orientacyjnie: <b>'+msg+'</b>. Finalny transport dobierzemy przy wycenie.';
 }
 students.addEventListener('input',updateTransport);guardians.addEventListener('input',updateTransport);
 document.querySelector('#tripFilters').addEventListener('submit',e=>{e.preventDefault();document.querySelector('.results-head').scrollIntoView({behavior:'smooth'});});
}
const m=location.pathname.match(/^\/kategoria\/([^/]+)/); if(m)renderCategory(m[1]);