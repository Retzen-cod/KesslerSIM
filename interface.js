import { SpaceWarSimulator } from './simulator.js';

const simulator = new SpaceWarSimulator();
let simulationInterval = null;
let currentSpeed = 1000; // 1 segundo por defecto

// Variables para el síndrome de Kessler
let kesslerReached = false;
let kesslerDate = null;
let kesslerTotalMissiles = 0;
let kesslerDays = 0;

// Funciones de actualización de UI
function updateStats(stats) {
    if (!stats) return;
    
    // Asegurarnos de que los valores sean números enteros
    const elements = {
        'missilesStat': Math.floor(stats.totalMissiles),
        'fragmentsStat': Math.floor(stats.activeFragments),
        'collisionsStat': Math.floor(stats.collisions),
        'kesslerIndexStat': `${Math.floor(stats.kesslerIndex)}%`
    };

    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            const stat = element.querySelector('.text-2xl');
            if (stat) stat.textContent = value.toString();
        }
    });

    if (stats.kesslerReached && stats.kesslerStats) {
        showKesslerResults(stats.kesslerStats);
    }
}

function showKesslerResults(stats) {
    clearInterval(simulationInterval);
    simulationInterval = null;
    document.getElementById('playButton').textContent = 'Iniciar Simulación ▶';

    const message = `
    ¡SÍNDROME DE KESSLER ALCANZADO! 💀
    
    Misiles necesarios: ${stats.totalMissiles}
    Fecha del síndrome: ${stats.kesslerDate.toLocaleDateString()}
    Días desde el inicio: ${stats.daysFromStart}
    `;
    
    alert(message);
}

function handleDeleteCountry(e) {
    e.preventDefault(); // Add this to ensure the event is handled properly
    const code = e.target.dataset.code;
    simulator.removeCountry(code);
    
    // Remover del selector de ataques
    const option = document.querySelector(`#attackCountry option[value="${code}"]`);
    if (option) option.remove();
    
    updateCountryList();
}

function updateCountryList() {
    const countryList = document.getElementById('countryList');
    if (!countryList) return;

    const activeCountries = document.querySelectorAll('#attackCountry option:not([disabled])');
    
    countryList.innerHTML = Array.from(activeCountries).map(option => `
        <div class="flex justify-between items-center bg-gray-100 p-3 rounded mb-2">
            <span>${option.textContent}</span>
            <span>${option.dataset.missiles} misiles/semana</span>
            <button class="delete-country text-red-500 hover:text-red-700" data-code="${option.value}">
                Eliminar ☠️
            </button>
        </div>
    `).join('');
    
    // Remove old listeners before adding new ones
    document.querySelectorAll('.delete-country').forEach(btn => {
        btn.removeEventListener('click', handleDeleteCountry);
        btn.addEventListener('click', handleDeleteCountry);
    });
}

function handleAddCountry() {
    const countrySelect = document.getElementById('countryPicker');
    const missilesInput = document.getElementById('missilesPerWeek');
    const attackSelect = document.getElementById('attackCountry');

    const countryCode = countrySelect.value;
    const countryName = countrySelect.options[countrySelect.selectedIndex]?.text;
    const missiles = parseInt(missilesInput.value);

    if (!missiles || missiles < 1 || !countryCode) {
        alert('¿Datos inválidos? ¿Es en serio? 💀');
        return;
    }

    // Añadir al simulador
    simulator.addCountry(countryCode, missiles);

    // Añadir al selector de ataques
    const option = document.createElement('option');
    option.value = countryCode;
    option.textContent = countryName;
    option.dataset.missiles = missiles;
    attackSelect.appendChild(option);

    // Actualizar UI y limpiar input
    updateCountryList();
    missilesInput.value = '';
    countrySelect.value = '';
}

function updateScheduledAttacks() {
    const container = document.getElementById('scheduledAttacks');
    if (!container) return;

    container.innerHTML = simulator.scheduledAttacks.map(attack => `
        <div class="flex justify-between items-center bg-gray-100 p-3 rounded mb-2">
            <span>${attack.countryCode}</span>
            <span>${new Date(attack.date).toLocaleDateString()}</span>
            <span>${attack.missiles} misiles</span>
            <button class="delete-attack text-red-500 hover:text-red-700" 
                    data-date="${attack.date.toISOString()}" data-country="${attack.countryCode}">
                Cancelar ❌
            </button>
        </div>
    `).join('');
}

// Función para verificar el síndrome de Kessler
function checkKesslerSyndrome() {
    const kesslerIndexElement = document.getElementById('kesslerIndexStat');
    const kesslerIndex = parseInt(kesslerIndexElement.querySelector('.text-2xl').textContent);
    
    if (kesslerIndex >= 100 && !kesslerReached) {
        kesslerReached = true;
        document.body.classList.add('shake');
        alert('¡SÍNDROME DE KESSLER ALCANZADO! 💀');
    }
}

function updateCurrentDate(date) {
    const currentDateElement = document.getElementById('currentDate');
    if (currentDateElement) {
        currentDateElement.textContent = new Date(date).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// Modificar la función de reset
function handleReset() {
    clearInterval(simulationInterval);
    simulationInterval = null;
    
    // Reiniciar el simulador
    simulator.reset();
    
    // Reiniciar la interfaz
    document.getElementById('playButton').textContent = 'Iniciar Simulación ▶';
    document.body.classList.remove('shake');
    kesslerReached = false;
    
    // Reiniciar los contadores
    updateStats({
        totalMissiles: 0,
        activeFragments: 0,
        collisions: 0,
        kesslerIndex: 0,
        kesslerReached: false,
        kesslerStats: null
    });
    
    // Limpiar listas
    document.getElementById('countryList').innerHTML = '';
    document.getElementById('scheduledAttacks').innerHTML = '';
    document.getElementById('attackCountry').innerHTML = '<option value="" disabled selected>Seleccionar País</option>';
    
    // Limpiar campos de entrada
    document.getElementById('warStartDate').value = '';
    document.getElementById('countryPicker').value = '';
    document.getElementById('missilesPerWeek').value = '';
}

// Inicialización de eventos
document.addEventListener('DOMContentLoaded', () => {
    const playButton = document.getElementById('playButton');
    const resetButton = document.getElementById('resetButton');
    const addCountryButton = document.getElementById('addCountryButton');
    
    if (playButton) {
        playButton.addEventListener('click', () => {
            if (!simulationInterval) {
                const startDate = document.getElementById('warStartDate').value;
                if (!startDate) {
                    alert('¡Elige una fecha para iniciar la guerra!');
                    return;
                }
                simulator.setStartDate(new Date(startDate));
                simulationInterval = setInterval(() => {
                    const stats = simulator.update();
                    if (stats) {
                        updateStats(stats);
                        updateCurrentDate(simulator.currentDate);
                        checkKesslerSyndrome();
                    }
                }, currentSpeed);
                playButton.textContent = 'Pausar ⏸';
            } else {
                clearInterval(simulationInterval);
                simulationInterval = null;
                playButton.textContent = 'Iniciar Simulación ▶';
            }
        });
    }

    if (resetButton) {
        resetButton.removeEventListener('click', handleReset); // Remover listener existente
        resetButton.addEventListener('click', handleReset); // Añadir nuevo listener
    }

    // Initialize speed buttons
    document.querySelectorAll('.speed-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const speedMultiplier = parseInt(btn.dataset.speed);
            currentSpeed = 1000 / speedMultiplier;
            
            // Remover clase activa de todos los botones
            document.querySelectorAll('.speed-btn').forEach(b => 
                b.classList.remove('bg-blue-500', 'text-white'));
            
            // Agregar clase activa al botón seleccionado
            btn.classList.add('bg-blue-500', 'text-white');

            if (simulationInterval) {
                clearInterval(simulationInterval);
                simulationInterval = setInterval(() => {
                    const stats = simulator.update();
                    if (stats) {
                        updateStats(stats);
                        updateCurrentDate(simulator.currentDate);
                        checkKesslerSyndrome();
                    }
                }, currentSpeed);
            }
        });
    });

    if (addCountryButton) {
        addCountryButton.addEventListener('click', handleAddCountry);
    }

    const scheduleAttackButton = document.getElementById('scheduleAttackButton');
    if (scheduleAttackButton) {
        scheduleAttackButton.addEventListener('click', () => {
            const country = document.getElementById('attackCountry').value;
            const date = document.getElementById('attackDate').value;
            const missiles = parseInt(document.getElementById('attackMissiles').value);

            if (!country || !date || !missiles || missiles < 1) {
                alert('¿Datos inválidos para el ataque? ¿Es en serio? 💀');
                return;
            }

            simulator.scheduleAttack(country, date, missiles);
            updateScheduledAttacks();
            
            // Limpiar campos
            document.getElementById('attackMissiles').value = '';
            document.getElementById('attackDate').value = '';
            document.getElementById('attackCountry').value = '';
        });
    }
});
