 //common name
    console.log(countries[0].name.common);
    //first capital
    console.log(countries[0].capital[0]);
    //first currency name
    const currencyValue = Object.values(countries[0].currencies)[0];
    console.log(currencyValue.name);
    //flag png
    console.log(countries[0].flags.png);
async function getCountries() {
  try {
    const result = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,capital,currencies,flags",
    );
    const countries = await result.json();
    console.log(countries);
    //print for the first country the:
    //common name
    console.log(countries[0].name.common);
    //first capital
    console.log(countries[0].capital[0]);
    //first currency name
    const currencyValue = Object.values(countries[0].currencies)[0];
    console.log(currencyValue.name);
    //flag png
    console.log(countries[0].flags.png);

    

  } catch (error) {
    console.log(error);
  }
}
getCountries();