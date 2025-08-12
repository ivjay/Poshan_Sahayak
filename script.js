document.addEventListener('DOMContentLoaded', () => {
    // --- DATABASE ---
    const nepaliFoods = [
        { name: "White Rice (boiled, 100g)", calories: 130, protein: 2.4, carbs: 28.2, fat: 0.3 },
        { name: "Brown Rice (boiled, 100g)", calories: 111, protein: 2.6, carbs: 23.0, fat: 0.9 },
        { name: "Wheat Roti (1 medium, 40g)", calories: 110, protein: 3.6, carbs: 18.6, fat: 2.0 },
        { name: "Dal Bhat (Plate, avg)", calories: 750, protein: 20, carbs: 120, fat: 10 },
        { name: "Momo (10 pcs)", calories: 450, protein: 22, carbs: 45, fat: 16 },
        { name: "Sel Roti (1 pc ~40g)", calories: 140, protein: 2.0, carbs: 20.0, fat: 5.5 },
        { name: "Samosa (1 medium)", calories: 168, protein: 3.0, carbs: 22, fat: 8.0 },
        { name: "Pani Puri (6 pieces)", calories: 170, protein: 3.0, carbs: 30, fat: 3.0 },
        { name: "Chicken Momo (10 pcs)", calories: 420, protein: 24, carbs: 42, fat: 14 },
        { name: "Thukpa (1 bowl)", calories: 320, protein: 10, carbs: 45, fat: 8 },
        { name: "Chowmein (veg, 1 plate)", calories: 420, protein: 9, carbs: 60, fat: 12 },
        { name: "Dal (1 cup ~200g)", calories: 230, protein: 12, carbs: 34, fat: 2 },
        { name: "Tarkari (mixed veg, 1 cup)", calories: 150, protein: 4, carbs: 20, fat: 6 },
        { name: "Aloo Tama (1 bowl)", calories: 180, protein: 4, carbs: 25, fat: 6 },
        { name: "Kheer (rice pudding, 1 cup)", calories: 220, protein: 5.5, carbs: 36, fat: 6 },
        { name: "Lassi (sweet, 1 cup)", calories: 220, protein: 6.0, carbs: 28, fat: 9 },
        { name: "Boiled Egg (1 large ~50g)", calories: 78, protein: 6.5, carbs: 0.6, fat: 5.3 },
        { name: "Chicken (breast, cooked, 100g)", calories: 165, protein: 31.0, carbs: 0, fat: 3.6 },
    ];

    // --- STATE & LOCAL STORAGE ---
    let currentMeal = JSON.parse(localStorage.getItem('currentMeal')) || [];
    let dailyCalorieHistory = JSON.parse(localStorage.getItem('dailyCalorieHistory')) || {};
    let userProfile = JSON.parse(localStorage.getItem('userProfile')) || {
        name: 'Guest User',
        weight: null,
        height: null
    };

    // --- DOM ELEMENTS (Dynamically select based on current page) ---
    const foodSearch = document.getElementById('food-search');
    const foodDropdown = document.getElementById('food-dropdown');
    const quantityInput = document.getElementById('quantity-input');
    const addFoodBtn = document.getElementById('add-food-btn');
    const resetBtn = document.getElementById('reset-btn');
    const mealList = document.getElementById('meal-list');
    const emptyMealText = document.getElementById('empty-meal-text');
    const totalCaloriesEl = document.getElementById('total-calories')?.querySelector('p:nth-child(2)');
    
    // Profile Page Elements
    const profileNameEl = document.getElementById('profile-name');
    const profileWeightEl = document.getElementById('profile-weight');
    const profileHeightEl = document.getElementById('profile-height');
    const profileCalorieGoalEl = document.getElementById('profile-calorie-goal');
    const profileTodayCaloriesEl = document.getElementById('profile-today-calories');
    const bmiValueEl = document.getElementById('bmi-value');
    const bmiCategoryEl = document.getElementById('bmi-category');
    const monthlyChartCanvas = document.getElementById('monthly-calories-chart');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const profileFormContainer = document.getElementById('profile-form-container');
    const profileNameInput = document.getElementById('profile-name-input');
    const profileWeightInput = document.getElementById('profile-weight-input');
    const profileHeightInput = document.getElementById('profile-height-input');
    const saveProfileBtn = document.getElementById('save-profile-btn');

    let selectedFoodItem = null;
    let monthlyChart;

    // --- FUNCTIONS ---
    function renderFoodDropdown(filteredFoods) {
        if (!foodDropdown) return;
        foodDropdown.innerHTML = '';
        if (filteredFoods.length > 0) {
            filteredFoods.forEach(food => {
                const foodDiv = document.createElement('div');
                foodDiv.textContent = food.name;
                foodDiv.setAttribute('data-value', food.name);
                foodDiv.addEventListener('click', () => {
                    foodSearch.value = food.name;
                    selectedFoodItem = food;
                    foodDropdown.classList.add('hidden');
                });
                foodDropdown.appendChild(foodDiv);
            });
        } else {
            foodDropdown.innerHTML = '<div class="text-gray-500 p-3">No results found</div>';
        }
    }

    function updateDisplay() {
        if (mealList) {
            mealList.innerHTML = '';
            if (currentMeal.length === 0) {
                emptyMealText.style.display = 'block';
            } else {
                emptyMealText.style.display = 'none';
                currentMeal.forEach((item, index) => {
                    const itemEl = document.createElement('div');
                    itemEl.className = 'food-item flex justify-between items-center bg-gray-700 p-4 rounded-xl';
                    itemEl.innerHTML = `
                        <div>
                            <p class="font-semibold text-gray-200">${item.name}</p>
                            <p class="text-sm text-gray-400">${item.quantity} x ${item.caloriesPerUnit.toFixed(0)} kcal</p>
                        </div>
                        <div class="text-right">
                            <p class="font-bold text-lg text-cool-gradient">${item.calories.toFixed(0)} kcal</p>
                            <button data-index="${index}" class="remove-btn text-xs text-red-400 hover:text-red-500 font-semibold mt-1">Remove</button>
                        </div>
                    `;
                    mealList.appendChild(itemEl);
                });
            }
        }

        const totals = currentMeal.reduce((acc, item) => {
            acc.calories += item.calories;
            acc.protein += item.protein;
            acc.carbs += item.carbs;
            acc.fat += item.fat;
            return acc;
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

        if (totalCaloriesEl) {
            totalCaloriesEl.textContent = totals.calories.toFixed(0);
            document.getElementById('total-protein').querySelector('p:nth-child(2)').textContent = totals.protein.toFixed(1);
            document.getElementById('total-carbs').querySelector('p:nth-child(2)').textContent = totals.carbs.toFixed(1);
            document.getElementById('total-fat').querySelector('p:nth-child(2)').textContent = totals.fat.toFixed(1);
        }

        updateDailyCalorieHistory(totals.calories);
        localStorage.setItem('currentMeal', JSON.stringify(currentMeal));
    }

    function handleAddFood() {
        const quantity = parseFloat(quantityInput.value);
        const foodData = selectedFoodItem;

        if (!foodData || isNaN(quantity) || quantity <= 0) {
            alert("Please select a food item and enter a valid quantity.");
            return;
        }

        const mealItem = {
            id: Date.now(),
            name: foodData.name,
            quantity: quantity,
            caloriesPerUnit: foodData.calories,
            calories: foodData.calories * quantity,
            protein: foodData.protein * quantity,
            carbs: foodData.carbs * quantity,
            fat: foodData.fat * quantity,
        };
        currentMeal.push(mealItem);
        updateDisplay();
        quantityInput.value = 1;
        foodSearch.value = '';
        selectedFoodItem = null;
    }

    function handleRemoveItem(e) {
        if (e.target.classList.contains('remove-btn')) {
            const index = parseInt(e.target.dataset.index);
            currentMeal.splice(index, 1);
            updateDisplay();
        }
    }

    function handleResetMeal() {
        if (confirm('Are you sure you want to reset your meal?')) {
            currentMeal = [];
            updateDisplay();
        }
    }
    
    // --- BMI & Profile Functions ---
    function calculateBMI(weight, height) {
        if (!weight || !height) return { bmi: null, category: 'N/A', color: 'text-gray-400' };
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        
        let category;
        let color;
        if (bmi < 18.5) { category = "Underweight"; color = "text-yellow-400"; }
        else if (bmi >= 18.5 && bmi < 24.9) { category = "Normal weight"; color = "text-green-400"; }
        else if (bmi >= 25 && bmi < 29.9) { category = "Overweight"; color = "text-orange-400"; }
        else { category = "Obese"; color = "text-red-400"; }
        
        return { bmi, category, color };
    }

    function calculateDailyCalorieNeeds(weight, height) {
        if (!weight || !height) return null;
        const BMR_estimation = 10 * weight + 6.25 * height - 5 * 30 + 5;
        const TDEE = BMR_estimation * 1.55;
        return TDEE;
    }

    // --- History & Chart Functions ---
    function updateDailyCalorieHistory(currentTotalCalories) {
        const today = new Date().toISOString().slice(0, 10);
        dailyCalorieHistory[today] = currentTotalCalories;
        
        const dates = Object.keys(dailyCalorieHistory).sort();
        if (dates.length > 30) {
            delete dailyCalorieHistory[dates[0]];
        }
        
        localStorage.setItem('dailyCalorieHistory', JSON.stringify(dailyCalorieHistory));
        if (monthlyChart) updateMonthlyChart();
    }

    function updateMonthlyChart() {
        if (!monthlyChartCanvas) return;
        const dates = Object.keys(dailyCalorieHistory).sort();
        const labels = dates.map(date => date.slice(5));
        const data = dates.map(date => dailyCalorieHistory[date]);

        const chartColors = {
            main: 'rgba(255, 140, 0, 0.8)',
            border: 'rgba(255, 140, 0, 1)',
            grid: 'rgba(255, 255, 255, 0.1)',
            text: '#e5e7eb'
        };

        if (monthlyChart) {
            monthlyChart.data.labels = labels;
            monthlyChart.data.datasets[0].data = data;
            monthlyChart.update();
        } else {
            monthlyChart = new Chart(monthlyChartCanvas, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Daily Calories',
                        data: data,
                        backgroundColor: chartColors.main,
                        borderColor: chartColors.border,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: chartColors.grid },
                            ticks: { color: chartColors.text },
                            title: { display: true, text: 'Calories (kcal)', color: chartColors.text }
                        },
                        x: {
                            grid: { color: chartColors.grid },
                            ticks: { color: chartColors.text },
                            title: { display: true, text: 'Date', color: chartColors.text }
                        }
                    },
                    plugins: {
                        legend: { labels: { color: chartColors.text } }
                    }
                }
            });
        }
    }

    // --- Initialization and Event Listeners ---
    if (foodSearch) {
        foodSearch.addEventListener('input', () => {
            const searchTerm = foodSearch.value.toLowerCase();
            const filteredFoods = nepaliFoods.filter(food => food.name.toLowerCase().includes(searchTerm));
            renderFoodDropdown(filteredFoods);
            foodDropdown.classList.remove('hidden');
            selectedFoodItem = null;
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.custom-select-container')) {
                foodDropdown.classList.add('hidden');
            }
        });

        addFoodBtn.addEventListener('click', handleAddFood);
        resetBtn.addEventListener('click', handleResetMeal);
        if (mealList) { mealList.addEventListener('click', handleRemoveItem); }
        updateDisplay();
        renderFoodDropdown(nepaliFoods);
    }
    
    if (profileNameEl) {
        const today = new Date().toISOString().slice(0, 10);
        const todayCalories = dailyCalorieHistory[today] || 0;
        const { bmi, category, color } = calculateBMI(userProfile.weight, userProfile.height);
        const dailyCalorieGoal = calculateDailyCalorieNeeds(userProfile.weight, userProfile.height);

        profileNameEl.textContent = userProfile.name;
        profileWeightEl.textContent = userProfile.weight || '--';
        profileHeightEl.textContent = userProfile.height || '--';
        profileTodayCaloriesEl.textContent = todayCalories.toFixed(0);
        profileCalorieGoalEl.textContent = dailyCalorieGoal ? dailyCalorieGoal.toFixed(0) : '--';
        
        bmiValueEl.textContent = bmi ? bmi.toFixed(1) : '--';
        bmiCategoryEl.textContent = category;
        bmiCategoryEl.className = `text-sm font-medium mt-1 ${color}`;
        
        editProfileBtn.addEventListener('click', () => {
            profileFormContainer.classList.toggle('hidden');
            profileNameInput.value = userProfile.name !== 'Guest User' ? userProfile.name : '';
            profileWeightInput.value = userProfile.weight || '';
            profileHeightInput.value = userProfile.height || '';
        });

        saveProfileBtn.addEventListener('click', () => {
            userProfile.name = profileNameInput.value || 'Guest User';
            userProfile.weight = parseFloat(profileWeightInput.value) || null;
            userProfile.height = parseFloat(profileHeightInput.value) || null;
            localStorage.setItem('userProfile', JSON.stringify(userProfile));
            window.location.reload();
        });
        
        updateMonthlyChart();
    }
});