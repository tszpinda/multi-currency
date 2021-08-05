(async () => {
    const DEFAULT_CURRENCY_ID = 'GB';
    // id - matches Country Code - as in ISO3166 and here - https://about.ip2c.org/#outputs
    // currency - used for formatting the display
    // name - the name in the dropdown
    const currencies = [
        { id: 'GB', currency: 'GBP', name: 'GBP', rate: 1 },
        { id: 'US', currency: 'USD', name: 'USD', rate: 1.39 },
        { id: 'AU', currency: 'AUD', name: 'AUD', rate: 1.88 },
    ];
    
    const expectedNumberOfPlans = 6;
    const $priceList = document.getElementById('price-list');
    const $billedAnnually = $priceList.getElementsByClassName('price-cost-one');
    const $billedMonthly = $priceList.getElementsByClassName('price-cost-two');
    if ($billedAnnually.length !== expectedNumberOfPlans || $billedMonthly.length !== expectedNumberOfPlans) {
        console.log('invalid number of plans', expectedNumberOfPlans, $billedAnnually.length, $billedMonthly.length);
    }

    const userCurrencyId = () => {
        return new Promise(resolve => {
          const currencyId = localStorage.getItem('jn.currency');
          if (currencyId)
            return resolve(currencyId)
          window
            .fetch('https://ip2c.org/self')
            .then(response => response.text())
            .then(data => {
              const [status, countryCode] = String(data).split(';');
              return status === '1' ? resolve(countryCode) : resolve(DEFAULT_CURRENCY_ID);
            })
            .catch(err => {
              console.log(err);
              console.log('Unable to fetch user location');
              resolve(DEFAULT_CURRENCY_ID);
            });
        });
      }
    
    const roundUp = (number, currency) => {
        const hideDecimalPlaces = false;
        const numberFormatOptions = {
            minimumFractionDigits: hideDecimalPlaces ? 0 : 2,
            maximumFractionDigits: hideDecimalPlaces ? 0 : 2,
        };
        return number.toLocaleString('en', { style: 'currency', currency: currency, ...numberFormatOptions })
    }
    
    const updatePrice = (currencyId) => {
        const currency = currencies.filter(c => c.id == currencyId)[0];
        const $priceList = document.getElementById('price-list');
        const $billedAnnually = $priceList.getElementsByClassName('price-cost-one');
        const $billedMonthly = $priceList.getElementsByClassName('price-cost-two');
        for (const $price of $billedAnnually) {
            const newPrice = roundUp($price.dataset.gbp * currency.rate, currency.currency);
            $price.innerHTML = newPrice + '<span>/mo</span>';
        }
        for (const $price of $billedMonthly) {
            const newPrice = roundUp($price.dataset.gbp * currency.rate, currency.currency);
            $price.innerHTML = newPrice + '<span>/mo</span>';
        }
    };
    
    const createDropdown = (currencies, selectedId) => {
        const $select = document.getElementById('currency-select');
        $select.innerHTML = '';
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const optionValue = currency.id;
            const $option = document.createElement("option");
            $option.innerHTML = currency.name;
            $option.setAttribute("value", optionValue);
            $option.setAttribute("data-description", currency.name);
            // selected
            if (optionValue === selectedId)
                $option.setAttribute('selected', 'selected');
            $select.appendChild($option);
        }
        $select.removeAttribute('disabled');
        updatePrice(selectedId);
        $select.addEventListener('change', function() {
            updatePrice(this.value);
            localStorage.setItem('jn.currency', this.value);
        }, false);
    }
    const currencyId = await userCurrencyId();
    createDropdown(currencies, currencyId);
})();
