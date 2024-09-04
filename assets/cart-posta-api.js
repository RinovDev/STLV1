function initializeCityAndBranchSearch() {
    let selectedCityRef = null;
    let citiesData = [];
    let branchesData = [];

    async function fetchInitialData() {
        try {
            const citiesResponse = await fetch('https://limitless-beach-64457-3699b9a1e5e2.herokuapp.com/get-cities');
            citiesData = await citiesResponse.json();
        } catch (error) {
            console.error('Ошибка при получении городов:', error);
        }
    }

    async function fetchBranchesForCity(cityRef) {
        try {
            const branchesResponse = await fetch(`https://limitless-beach-64457-3699b9a1e5e2.herokuapp.com/get-branches?cityRef=${cityRef}`);
            branchesData = await branchesResponse.json();
            updateBranchList(''); // Отображаем начальный список отделений
        } catch (error) {
            console.error('Ошибка при получении отделений:', error);
        }
    }

    function updateCitySuggestions(query) {
        const suggestionsContainer = document.getElementById('city-suggestions');
        suggestionsContainer.innerHTML = '';

        const filteredCities = citiesData.filter(city => 
            city.Description.toLowerCase().includes(query.toLowerCase())
        );

        let exactMatch = false;

        filteredCities.forEach(city => {
            const suggestionElement = document.createElement('div');
            suggestionElement.classList.add('autocomplete-suggestion');
            suggestionElement.textContent = city.Description;
            suggestionElement.dataset.ref = city.Ref;

            if (city.Description.toLowerCase() === query.toLowerCase()) {
                exactMatch = true;
                document.getElementById('city').value = city.Description;
                selectedCityRef = city.Ref;
                suggestionsContainer.innerHTML = '';
                fetchBranchesForCity(city.Ref);
            }

            suggestionElement.addEventListener('click', function() {
                document.getElementById('city').value = city.Description;
                selectedCityRef = city.Ref;
                suggestionsContainer.innerHTML = '';
                fetchBranchesForCity(city.Ref);
            });

            suggestionsContainer.appendChild(suggestionElement);
        });

        if (exactMatch) {
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.style.display = 'none';
        } else {
            suggestionsContainer.style.display = filteredCities.length > 0 ? 'block' : 'none';
        }
    }

    function updateBranchList(query) {
        const branchSuggestions = document.getElementById('branch-suggestions');
        branchSuggestions.innerHTML = '';
        
        if (!selectedCityRef) {
            branchSuggestions.style.display = 'none';
            return;
        }

        const filteredBranches = branchesData.filter(branch => 
            branch.Description.toLowerCase().includes(query.toLowerCase())
        );

        if (filteredBranches.length === 0) {
            const noResults = document.createElement('div');
            noResults.classList.add('autocomplete-suggestion');
            noResults.textContent = 'Відділення не знайдено';
            branchSuggestions.appendChild(noResults);
        } else {
            filteredBranches.forEach(branch => {
                const suggestion = document.createElement('div');
                suggestion.classList.add('autocomplete-suggestion');
                suggestion.textContent = branch.Description;
                suggestion.addEventListener('click', function() {
                    document.getElementById('branch-search').value = branch.Description;
                    branchSuggestions.innerHTML = '';
                });
                branchSuggestions.appendChild(suggestion);
            });
        }
        
        branchSuggestions.style.display = 'block';
    }

    function filterBranches(query) {
        const branchSuggestions = document.getElementById('branch-suggestions');
        const suggestions = branchSuggestions.children;
        let visibleCount = 0;
        
        for (let item of suggestions) {
            if (item.textContent.toLowerCase().includes(query.toLowerCase())) {
                item.style.display = '';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        }
        
        if (visibleCount === 0) {
            branchSuggestions.innerHTML = '';
            const noResults = document.createElement('div');
            noResults.classList.add('autocomplete-suggestion');
            noResults.textContent = 'Відділення не знайдено';
            branchSuggestions.appendChild(noResults);
        }
        
        branchSuggestions.style.display = 'block';
    }

    const branchSearch = document.getElementById('branch-search');
    if (branchSearch) {
        branchSearch.addEventListener('input', function() {
            const query = this.value.trim();
            if (selectedCityRef) {
                updateBranchList(query);
            } else {
                document.getElementById('branch-suggestions').innerHTML = '';
                document.getElementById('branch-suggestions').style.display = 'none';
            }
        });

        branchSearch.addEventListener('focus', function() {
            if (selectedCityRef && branchesData.length > 0) {
                updateBranchList('');
            }
        });

        branchSearch.addEventListener('blur', function() {
            document.getElementById('branch-suggestions').style.display = 'none';
        });
    }

    const cityInput = document.getElementById('city');
    if (cityInput) {
        cityInput.addEventListener('input', function() {
            clearBranchSelection();
            const query = this.value.trim();
            updateCitySuggestions(query);
        });
    }

    function clearBranchSelection() {
      const branchSearch = document.getElementById('branch-search');
      if (branchSearch) {
        branchSearch.value = '';
        branchSearch.placeholder = 'Виберіть відділення';
      }
    }

    function highlightEmptyFields() {
      const fields = ['first-name', 'last-name', 'phone', 'city', 'branch-search'];
      let firstEmptyField = null;
      
      fields.forEach(id => {
        const field = document.getElementById(id);
        if (field && !field.value.trim()) {
          field.classList.add('input-error');
          if (!firstEmptyField) {
            firstEmptyField = field;
          }
        }
      });

      if (firstEmptyField) {
        firstEmptyField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      setTimeout(() => {
        document.querySelectorAll('.input-error').forEach(el => {
          el.classList.remove('input-error');
        });
      }, 1500);
    }

    const cartDrawer = document.getElementById('CartDrawer');
    if (cartDrawer) {
      cartDrawer.addEventListener('click', function(event) {
        if (event.target && event.target.id === 'CartDrawer-Checkout') {
          event.preventDefault();
          handleCheckoutClick();
        }
      });
    }

    async function getComment(){
      let comment = document.querySelector('textarea[name="comment"]');
        console.log(comment.value)
        fetch('/cart/update.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              note: comment.value
          }),
        })
        .then(response => response.json())
        .catch(error => {
          console.error('Ошибка:', error);
        });
    };

    async function handleCheckoutClick() {
      
      const fields = {
        city: document.getElementById('city').value.trim(),
        branch: document.getElementById('branch-search').value.trim(), 
        firstName: document.getElementById('first-name').value.trim(),
        lastName: document.getElementById('last-name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        zip: '00012'
      };

      let isValid = true;
      let emptyFields = [];

      for (let [key, value] of Object.entries(fields)) {
        if (!value) {
          isValid = false;
          emptyFields.push(key);
        }
      }

      if (isValid) {
        await getComment()
        const params = new URLSearchParams({
          'checkout[shipping_address][first_name]': fields.firstName,
          'checkout[shipping_address][last_name]': fields.lastName,
          'checkout[shipping_address][address1]': fields.branch,
          'checkout[shipping_address][city]': fields.city,
          'checkout[phone]': fields.phone,
          'checkout[shipping_address][zip]': fields.zip,
        });

        const checkoutUrl = `/checkout?${params.toString()}`;

        setTimeout(() => {
          window.location.href = checkoutUrl;
        }, 200);
      } else {
        highlightEmptyFields();
      }
    }

    // Вызываем функцию для загрузки начальных данных
    fetchInitialData();
}
