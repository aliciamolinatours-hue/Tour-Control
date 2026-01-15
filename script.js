// Almacenamiento de datos
let trips = JSON.parse(localStorage.getItem('trips')) || [];
let selectedPaymentMethod = '';
let selectedCardTip = 0;

// Precio fijo del viaje
const RIDE_PRICE = 70;

// Inicializar la aplicación
function init() {
    updateTripList();
    updateSummary();
    setCurrentDate();
    setupPaymentButtons();
    generateMonthOptions();
    updateHistory();
    setupTipButtons();
    generateStatsMonthOptions();
    updateStats();
}

// Configurar botones de pago
function setupPaymentButtons() {
    document.getElementById('cash-btn').addEventListener('click', () => selectPayment('cash'));
    document.getElementById('card-btn').addEventListener('click', () => selectPayment('card'));
}

// Configurar botones de propinas
function setupTipButtons() {
    document.querySelectorAll('.tip-btn').forEach((btn, index) => {
        btn.addEventListener('click', function() {
            const tipAmounts = [0, 7, 10.5, 14];
            selectCardTip(tipAmounts[index]);
        });
    });
}

// Cambiar entre pestañas
function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    if (tabName === 'register') {
        document.querySelector('.tab:nth-child(1)').classList.add('active');
        document.getElementById('register-tab').classList.add('active');
    } else if (tabName === 'summary') {
        document.querySelector('.tab:nth-child(2)').classList.add('active');
        document.getElementById('summary-tab').classList.add('active');
    } else if (tabName === 'stats') {
        document.querySelector('.tab:nth-child(3)').classList.add('active');
        document.getElementById('stats-tab').classList.add('active');
    } else if (tabName === 'history') {
        document.querySelector('.tab:nth-child(4)').classList.add('active');
        document.getElementById('history-tab').classList.add('active');
    }
}

// Seleccionar método de pago
function selectPayment(method) {
    selectedPaymentMethod = method;
    document.querySelectorAll('.payment-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(method + '-btn').classList.add('active');
    document.getElementById('payment-method').value = method;
    
    // Mostrar/ocultar secciones de propinas según el método de pago
    if (method === 'cash') {
        document.getElementById('cash-tip-section').classList.remove('hidden');
        document.getElementById('card-tip-section').classList.add('hidden');
    } else {
        document.getElementById('cash-tip-section').classList.add('hidden');
        document.getElementById('card-tip-section').classList.remove('hidden');
    }
}

// Seleccionar propina con tarjeta
function selectCardTip(amount) {
    selectedCardTip = amount;
    document.getElementById('card-tip').value = amount;
    
    // Resaltar el botón seleccionado
    document.querySelectorAll('.tip-btn').forEach(btn => {
        btn.classList.remove('active');
        if (parseFloat(btn.textContent) === amount) {
            btn.classList.add('active');
        }
    });
}

// Establecer fecha actual
function setCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = now.toLocaleDateString('es-ES', options);
}

// Guardar nuevo viaje
document.getElementById('trip-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!selectedPaymentMethod) {
        alert('Por favor, selecciona un método de pago');
        return;
    }
    
    // Obtener la propina según el método de pago
    let tipAmount = 0;
    if (selectedPaymentMethod === 'cash') {
        tipAmount = parseFloat(document.getElementById('cash-tip').value) || 0;
    } else {
        tipAmount = selectedCardTip;
    }
    
    const trip = {
        id: Date.now(),
        country: document.getElementById('country').value,
        passengers: parseInt(document.getElementById('passengers').value),
        amount: RIDE_PRICE,
        tip: tipAmount,
        payment: selectedPaymentMethod,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString('es-ES')
    };
    
    trips.push(trip);
    saveTrips();
    updateTripList();
    updateSummary();
    updateStats();
    
    // Reiniciar formulario
    this.reset();
    document.getElementById('amount').value = RIDE_PRICE;
    selectedPaymentMethod = '';
    selectedCardTip = 0;
    document.querySelectorAll('.payment-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tip-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('cash-tip-section').classList.remove('hidden');
    document.getElementById('card-tip-section').classList.add('hidden');
    
    // Mostrar confirmación
    alert('¡Viaje registrado correctamente!');
});

// Guardar viajes en localStorage
function saveTrips() {
    localStorage.setItem('trips', JSON.stringify(trips));
}

// Actualizar lista de viajes
function updateTripList() {
    const tripList = document.getElementById('trip-list');
    tripList.innerHTML = '';
    
    const today = new Date().toLocaleDateString('es-ES');
    const todayTrips = trips.filter(trip => trip.date === today);
    
    if (todayTrips.length === 0) {
        tripList.innerHTML = '<p class="trip-item">No hay viajes registrados hoy</p>';
        return;
    }
    
    todayTrips.forEach(trip => {
        const tripElement = document.createElement('div');
        tripElement.className = 'trip-item';
        tripElement.innerHTML = `
            <div>
                <strong>${trip.country}</strong> - ${trip.passengers} pax
                <div><small>${trip.timestamp} - ${trip.payment === 'cash' ? 'Efectivo' : 'Tarjeta'}</small></div>
            </div>
            <div>
                <div>${trip.amount.toFixed(2)} €</div>
                <div><small>+${trip.tip.toFixed(2)} € propina</small></div>
                <button class="delete-btn" onclick="deleteTrip(${trip.id})">✕</button>
            </div>
        `;
        tripList.appendChild(tripElement);
    });
}

// Actualizar resumen
function updateSummary() {
    const today = new Date().toLocaleDateString('es-ES');
    const todayTrips = trips.filter(trip => trip.date === today);
    
    // Viajes en efectivo
    const cashTrips = todayTrips.filter(t => t.payment === 'cash');
    const totalCashTrips = cashTrips.length;
    const totalCashRides = cashTrips.reduce((sum, trip) => sum + trip.amount, 0);
    const totalCashTips = cashTrips.reduce((sum, trip) => sum + trip.tip, 0);
    
    // Viajes con tarjeta
    const cardTrips = todayTrips.filter(t => t.payment === 'card');
    const totalCardTrips = cardTrips.length;
    const totalCardRides = cardTrips.reduce((sum, trip) => sum + trip.amount, 0);
    const totalCardTips = cardTrips.reduce((sum, trip) => sum + trip.tip, 0);
    
    // Totales generales
    const totalTrips = totalCashTrips + totalCardTrips;
    const totalRides = totalCashRides + totalCardRides;
    const totalTips = totalCashTips + totalCardTips;
    const totalAmount = totalCashRides + totalCardRides + totalCashTips;
    
    // Efectivo a entregar al jefe (viajes en efectivo - propinas en tarjeta)
    const cashToDeliver = totalCashRides - totalCardTips;
    
    // Actualizar la interfaz
    document.getElementById('total-trips').textContent = totalTrips;
    
    document.getElementById('cash-rides-label').textContent = `Total viajes (70€ x ${totalCashTrips} viajes)`;
    document.getElementById('total-cash-rides').textContent = totalCashRides.toFixed(2) + ' €';
    document.getElementById('total-cash-tips').textContent = totalCashTips.toFixed(2) + ' €';
    
    document.getElementById('card-rides-label').textContent = `Total viajes (70€ x ${totalCardTrips} viajes)`;
    document.getElementById('total-card-rides').textContent = totalCardRides.toFixed(2) + ' €';
    document.getElementById('total-card-tips').textContent = totalCardTips.toFixed(2) + ' €';
    
    // Actualizar cálculo de efectivo a entregar
    document.getElementById('cash-delivery-calculation').textContent = 
        `${totalCashRides.toFixed(2)}€ - ${totalCardTips.toFixed(2)}€ = ${cashToDeliver.toFixed(2)}€`;
    document.getElementById('cash-to-deliver').textContent = `${cashToDeliver.toFixed(2)} € a entregar en sobre`;
    
    document.getElementById('total-rides').textContent = totalRides.toFixed(2) + ' €';
    document.getElementById('total-tips').textContent = totalTips.toFixed(2) + ' €';
    document.getElementById('total-amount').textContent = totalAmount.toFixed(2) + ' €';
}

// Eliminar viaje
function deleteTrip(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este viaje?')) {
        trips = trips.filter(trip => trip.id !== id);
        saveTrips();
        updateTripList();
        updateSummary();
        updateStats();
    }
}

// Generar opciones de mes para el historial
function generateMonthOptions() {
    const monthSelect = document.getElementById('month-select');
    monthSelect.innerHTML = '';
    
    // Obtener meses únicos con viajes
    const monthsWithTrips = {};
    trips.forEach(trip => {
        const date = new Date(trip.id);
        const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
        const monthName = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        monthsWithTrips[monthYear] = monthName;
    });
    
    // Añadir opciones
    Object.entries(monthsWithTrips).forEach(([value, text]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text.charAt(0).toUpperCase() + text.slice(1);
        monthSelect.appendChild(option);
    });
    
    // Agregar event listener para actualizar historial
    monthSelect.addEventListener('change', updateHistory);
    
    // Seleccionar el mes actual por defecto
    const now = new Date();
    const currentMonthYear = `${now.getFullYear()}-${now.getMonth()}`;
    if (monthsWithTrips[currentMonthYear]) {
        monthSelect.value = currentMonthYear;
    }
}

// Generar opciones de mes para estadísticas
function generateStatsMonthOptions() {
    const monthSelect = document.getElementById('stats-month-select');
    monthSelect.innerHTML = '';
    
    // Obtener meses únicos con viajes
    const monthsWithTrips = {};
    trips.forEach(trip => {
        const date = new Date(trip.id);
        const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
        const monthName = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        monthsWithTrips[monthYear] = monthName;
    });
    
    // Añadir opciones
    Object.entries(monthsWithTrips).forEach(([value, text]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text.charAt(0).toUpperCase() + text.slice(1);
        monthSelect.appendChild(option);
    });
    
    // Agregar event listener para actualizar estadísticas
    monthSelect.addEventListener('change', updateStats);
    
    // Seleccionar el mes actual por defecto
    const now = new Date();
    const currentMonthYear = `${now.getFullYear()}-${now.getMonth()}`;
    if (monthsWithTrips[currentMonthYear]) {
        monthSelect.value = currentMonthYear;
    }
}

// Actualizar estadísticas
function updateStats() {
    const monthSelect = document.getElementById('stats-month-select');
    const selectedValue = monthSelect.value;
    
    if (!selectedValue) {
        document.getElementById('stats-total-trips').textContent = '0';
        document.getElementById('stats-total-passengers').textContent = '0';
        document.getElementById('stats-cash-trips').textContent = '0';
        document.getElementById('stats-card-trips').textContent = '0';
        document.getElementById('country-stats').innerHTML = '<p>No hay datos para mostrar</p>';
        return;
    }
    
    const [year, month] = selectedValue.split('-').map(Number);
    const monthlyTrips = trips.filter(trip => {
        const tripDate = new Date(trip.id);
        return tripDate.getFullYear() === year && tripDate.getMonth() === month;
    });
    
    // Calcular estadísticas
    const totalTrips = monthlyTrips.length;
    const totalPassengers = monthlyTrips.reduce((sum, trip) => sum + trip.passengers, 0);
    const cashTrips = monthlyTrips.filter(t => t.payment === 'cash').length;
    const cardTrips = monthlyTrips.filter(t => t.payment === 'card').length;
    
    // Calcular estadísticas por país
    const countryStats = {};
    monthlyTrips.forEach(trip => {
        if (!countryStats[trip.country]) {
            countryStats[trip.country] = { count: 0, passengers: 0 };
        }
        countryStats[trip.country].count += 1;
        countryStats[trip.country].passengers += trip.passengers;
    });
    
    // Ordenar países por número de viajes
    const sortedCountries = Object.entries(countryStats)
        .sort((a, b) => b[1].count - a[1].count);
    
    // Actualizar la interfaz
    document.getElementById('stats-total-trips').textContent = totalTrips;
    document.getElementById('stats-total-passengers').textContent = totalPassengers;
    document.getElementById('stats-cash-trips').textContent = cashTrips;
    document.getElementById('stats-card-trips').textContent = cardTrips;
    
    // Mostrar estadísticas por país
    let countryHTML = '';
    if (sortedCountries.length === 0) {
        countryHTML = '<p>No hay viajes este mes</p>';
    } else {
        sortedCountries.forEach(([country, stats]) => {
            countryHTML += `
                <div class="country-item">
                    <span>${country}</span>
                    <span>${stats.count} viajes (${stats.passengers} pasajeros)</span>
                </div>
            `;
        });
    }
    document.getElementById('country-stats').innerHTML = countryHTML;
}

// Actualizar historial
function updateHistory() {
    const monthSelect = document.getElementById('month-select');
    const selectedValue = monthSelect.value;
    
    if (!selectedValue) {
        document.getElementById('monthly-summary').innerHTML = '<p>No hay datos para mostrar</p>';
        return;
    }
    
    const [year, month] = selectedValue.split('-').map(Number);
    const monthlyTrips = trips.filter(trip => {
        const tripDate = new Date(trip.id);
        return tripDate.getFullYear() === year && tripDate.getMonth() === month;
    });
    
    // Viajes en efectivo
    const cashTrips = monthlyTrips.filter(t => t.payment === 'cash');
    const totalCashTrips = cashTrips.length;
    const totalCashRides = cashTrips.reduce((sum, trip) => sum + trip.amount, 0);
    const totalCashTips = cashTrips.reduce((sum, trip) => sum + trip.tip, 0);
    
    // Viajes con tarjeta
    const cardTrips = monthlyTrips.filter(t => t.payment === 'card');
    const totalCardTrips = cardTrips.length;
    const totalCardRides = cardTrips.reduce((sum, trip) => sum + trip.amount, 0);
    const totalCardTips = cardTrips.reduce((sum, trip) => sum + trip.tip, 0);
    
    // Totales generales
    const totalPassengers = monthlyTrips.reduce((sum, trip) => sum + trip.passengers, 0);
    const totalRides = totalCashRides + totalCardRides;
    const totalTips = totalCashTips + totalCardTips;
    const totalAmount = totalCashRides + totalCardRides + totalCashTips;
    const totalDays = new Set(monthlyTrips.map(trip => new Date(trip.id).toDateString())).size;
    
    // Efectivo a entregar al jefe (viajes en efectivo - propinas en tarjeta)
    const cashToDeliver = totalCashRides - totalCardTips;
    
    const summaryHTML = `
        <div class="summary-item">
            <span>Total viajes:</span>
            <span>${monthlyTrips.length}</span>
        </div>
        <div class="summary-item">
            <span>Total pasajeros:</span>
            <span>${totalPassengers}</span>
        </div>
        
        <h3 style="margin-top: 20px;">Ingresos con Tarjeta</h3>
        <div class="summary-item">
            <span>Total viajes (70€ x ${totalCardTrips} viajes):</span>
            <span>${totalCardRides.toFixed(2)} €</span>
        </div>
        <div class="summary-item">
            <span>Total propinas con tarjeta:</span>
            <span>${totalCardTips.toFixed(2)} €</span>
        </div>
        
        <h3 style="margin-top: 20px;">Ingresos en Efectivo</h3>
        <div class="summary-item">
            <span>Total viajes (70€ x ${totalCashTrips} viajes):</span>
            <span>${totalCashRides.toFixed(2)} €</span>
        </div>
        <div class="summary-item">
            <span>Total propinas en efectivo:</span>
            <span>${totalCashTips.toFixed(2)} €</span>
        </div>
        
        <h3 style="margin-top: 20px;">Efectivo a entregar</h3>
        <div class="calculation">
            <div>${totalCashRides.toFixed(2)}€ - ${totalCardTips.toFixed(2)}€ = ${cashToDeliver.toFixed(2)}€</div>
            <div><strong>${cashToDeliver.toFixed(2)} € a entregar en sobre</strong></div>
        </div>
        
        <h3 style="margin-top: 20px;">Resumen General</h3>
        <div class="summary-item">
            <span>Total ingresos por viajes:</span>
            <span>${totalRides.toFixed(2)} €</span>
        </div>
        <div class="summary-item">
            <span>Total propinas:</span>
            <span>${totalTips.toFixed(2)} €</span>
        </div>
        <div class="summary-item summary-total">
            <span>Ganancia total:</span>
            <span>${totalAmount.toFixed(2)} €</span>
        </div>
        <div class="summary-item">
            <span>Días trabajados:</span>
            <span>${totalDays}</span>
        </div>
    `;
    
    document.getElementById('monthly-summary').innerHTML = summaryHTML;
}

// Exportar datos
function exportData() {
    // Crear datos en formato CSV
    let csv = 'Fecha,Hora,País,Pasajeros,Importe,Propina,Método de pago\n';
    
    trips.forEach(trip => {
        csv += `"${trip.date}","${trip.timestamp}","${trip.country}",${trip.passengers},${trip.amount},${trip.tip},"${trip.payment === 'cash' ? 'Efectivo' : 'Tarjeta'}"\n`;
    });
    
    // Crear blob y descargar
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toLocaleDateString('es-ES').replace(/\//g, '-');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `viajes-${date}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('Datos exportados correctamente. Busca el archivo CSV en tus descargas.');
}

// Reiniciar día
function resetDay() {
    if (confirm('¿Estás seguro de que quieres reiniciar el día? Se eliminarán todos los viajes de hoy.')) {
        const today = new Date().toLocaleDateString('es-ES');
        trips = trips.filter(trip => trip.date !== today);
        saveTrips();
        updateTripList();
        updateSummary();
        updateStats();
        alert('Datos del día reiniciados correctamente.');
    }
}

// Inicializar la aplicación al cargar
document.addEventListener('DOMContentLoaded', init);