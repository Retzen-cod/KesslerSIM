// Simulador de Guerra Espacial pero ahora sí con TODAS las ecuaciones 💀
class KesslerSimulation {
    constructor() {
        // 1. Parámetros Iniciales y Constantes (más estables que mi estado mental fr fr)
        this.V_LEO = 1.37e21;     // Volumen total de LEO (m³)
        this.A = 10;              // Área objetivo promedio (m²)
        this.v_rel = 7.6e3;       // Velocidad relativa promedio (m/s)
        this.Delta_t = 86400;     // Intervalo tiempo diario (s)
        this.f_m = 1000;          // Fragmentos por misil
        this.f_c = 20;            // Fragmentos por colisión
        this.delta = 0.01;        // Tasa de decaimiento orbital
        this.proportions = [0.5, 0.3, 0.2];  // Distribución por tamaños [pequeño, mediano, grande]
        
        // Estado de la simulación (más complicado que mi vida amorosa)
        this.activeCountries = new Map();    // {countryCode: missilesPerWeek}
        this.scheduledAttacks = new Map();   // {date: missiles}
        this.results = [];
        this.currentDate = new Date();
        this.isRunning = false;
    }

    // 2. Fragmentos Generados por Misiles
    calculateDailyMissiles(date) {
        const dayOfWeek = new Date(date).getDay();
        const M_daily = Array.from(this.activeCountries.values())
            .reduce((sum, weekly) => sum + (dayOfWeek === Math.floor(Math.random() * 7) ? weekly : 0), 0);

        const M_attack = this.scheduledAttacks.get(date) || 0;

        return Math.floor(M_daily + M_attack);
    }

    // 3. Decaimiento Orbital
    calculateOrbitalDecay(F_t) {
        // F_t_decay = F_t * (1 - delta)
        return F_t * (1 - this.delta);
    }

    // 4. Densidad de Fragmentos
    calculateDensity(F_t_decay) {
        // rho_t = F_t_decay / V_LEO
        return F_t_decay / this.V_LEO;
    }

    // 5. Probabilidad de Colisión y Colisiones
    calculateCollisionProbability(rho_t) {
        // P_collision = rho_t * v_rel * A * Delta_t
        return rho_t * this.v_rel * this.A * this.Delta_t;
    }

    calculateCollisions(P_collision, F_t_decay) {
        // C_t = floor(P_collision * F_t_decay)
        return Math.floor(P_collision * F_t_decay);
    }

    // 6. Fragmentos Generados por Colisiones
    calculateCollisionFragments(C_t) {
        // F_t_collision = C_t * f_c
        return C_t * this.f_c;
    }

    // 7. Distribución por Tamaños
    calculateSizeDistribution(F_t) {
        // F_i = F_t * p_i para i ∈ {pe queño, mediano, grande}
        return this.proportions.map(p => F_t * p);
    }

    // 8. Índice Kessler
    calculateKesslerIndex(rho_t) {
        // K_t = rho_t (simple pero letal como yo en los juegos fr)
        return rho_t;
    }

    // Simular un día de caos espacial
    simulateDay(F_t, date) {
        const M_t = this.calculateDailyMissiles(date);
        const F_t_new = M_t * this.f_m;

        const F_t_decay = this.calculateOrbitalDecay(F_t);

        const rho_t = this.calculateDensity(F_t_decay);
        const P_collision = this.calculateCollisionProbability(rho_t);
        const C_t = this.calculateCollisions(P_collision, F_t_decay);

        const F_t_collision = this.calculateCollisionFragments(C_t);

        const F_total = F_t_decay + F_t_new + F_t_collision;

        const sizeDistribution = this.calculateSizeDistribution(F_total);

        const kesslerIndex = this.calculateKesslerIndex(rho_t);

        return {
            date: date,
            missiles: M_t,
            fragments: Math.floor(F_total),
            collisions: C_t,
            density: rho_t,
            kesslerIndex: kesslerIndex,
            distribution: sizeDistribution,
            F_total
        };
    }

    // La función principal que simula el apocalipsis espacial
    simulate(days = 1) {
        this.isRunning = true;
        let F_t = this.results.length > 0 ? this.results[this.results.length - 1].F_total : 0;
        
        for (let t = 0; t < days; t++) {
            const dateStr = this.currentDate.toISOString().split('T')[0];
            const dayResult = this.simulateDay(F_t, dateStr);
            F_t = dayResult.F_total;
            
            this.results.unshift(dayResult); // Agregamos al inicio para mantener el último día primero
            this.currentDate.setDate(this.currentDate.getDate() + 1);

            if (dayResult.density >= 1e-9) {
                console.log("SÍNDROME KESSLER SPEEDRUN ANY% WR 💀");
                break;
            }
        }

        return this.results;
    }

    // Métodos de gestión (pa que no todo sea caos)
    addCountry(countryCode, missilesPerWeek) {
        if (missilesPerWeek <= 0) throw new Error("¿Misiles negativos? ¿Es en serio? 💀");
        this.activeCountries.set(countryCode, missilesPerWeek);
    }

    removeCountry(countryCode) {
        if (!this.activeCountries.has(countryCode)) {
            throw new Error("País no encontrado en la simulación 💀");
        }
        this.activeCountries.delete(countryCode);
    }

    scheduleAttack(date, missiles) {
        if (missiles < 0) throw new Error("Bruh, ¿misiles negativos? 💀");
        if (missiles === 0) {
            this.scheduledAttacks.delete(date);
        } else {
            this.scheduledAttacks.set(date, missiles);
        }
    }

    getResults() {
        return this.results;
    }

    reset() {
        this.activeCountries.clear();
        this.scheduledAttacks.clear();
        this.results = [];
        this.currentDate = new Date();
        this.isRunning = false;
    }
}

export default KesslerSimulation;

export class SpaceWarSimulator {
    constructor() {
        // Constantes alineadas con logic.py
        this.V_LEO = 1.37e21;
        this.A = 10;
        this.v_rel = 7.6e3;
        this.Delta_t = 86400;
        this.f_m = 1000;
        this.f_c = 20;
        this.delta = 0.01;

        // Estado de la simulación
        this.F_t = 0;
        this.countries = new Map();
        this.scheduledAttacks = [];
        this.currentDate = new Date();
        this.startDate = null;

        // Añadir contadores acumulativos
        this.totalMissilesLaunched = 0;
        this.totalCollisions = 0;
        this.currentF_t = 0;  // Añadido para tracking de fragmentos actuales
        this.currentCollisions = 0;  // Añadir contador de colisiones actual
        this.kesslerReached = false;
        this.kesslerStats = null;
    }

    setStartDate(date) {
        this.startDate = date;
        this.currentDate = new Date(date);
    }

    addCountry(countryCode, missilesPerWeek) {
        this.countries.set(countryCode, {
            missilesPerWeek: parseInt(missilesPerWeek),
            totalMissiles: 0
        });
    }

    scheduleAttack(countryCode, date, missiles) {
        this.scheduledAttacks.push({
            countryCode,
            date: new Date(date),
            missiles: parseInt(missiles)
        });
    }

    calcularFragmentosPorMisiles(M_weekly, M_attack = 0) {
        // Distribuir misiles semanales aleatoriamente como en Python
        const M_daily = Math.floor(M_weekly / 7);
        const M_t = M_daily + M_attack;
        return M_t * this.f_m;
    }

    calcularDecaimientoOrbital(F_t) {
        return F_t * (1 - this.delta);
    }

    calcularDensidadFragmentos(F_t) {
        return F_t / this.V_LEO;
    }

    calcularProbabilidadColision(rho_t) {
        return rho_t * this.v_rel * this.A * this.Delta_t;
    }

    calcularColisionesEsperadas(P_collision, F_t) {
        // Ajustar el cálculo de colisiones para que sea más sensible
        return Math.floor(P_collision * F_t * 1e3);  // Multiplicador para hacer las colisiones más notables
    }

    calcularFragmentosPorColisiones(C_t) {
        return C_t * this.f_c;
    }

    calcularFragmentosTotales(F_decay, F_new, F_collision) {
        return F_decay + F_new + F_collision;
    }

    calcularIndiceKessler(rho_t) {
        // Ajustar el cálculo del índice Kessler para ser más sensible
        const umbral = 1e-9;
        // Usar logaritmo para una escala más manejable
        const indice = Math.log10(rho_t / umbral) * 20 + 50;
        return Math.min(Math.max(indice, 0), 100);
        
    }

    update() {
        if (!this.startDate || this.kesslerReached) return null;

        // Calcular misiles totales del día
        // Dividir equitativamente los misiles semanales entre los 7 días
        let M_weekly = Array.from(this.countries.values())
            .reduce((sum, country) => sum + Math.ceil(country.missilesPerWeek / 7), 0);

        // Añadir misiles de ataques programados
        const ataquesHoy = this.scheduledAttacks.filter(attack => 
            attack.date.toDateString() === this.currentDate.toDateString()
        );
        let misilesDelDia = M_weekly + ataquesHoy.reduce((sum, attack) => sum + attack.missiles, 0);
        
        // Actualizar contadores y cálculos en el orden correcto
        this.totalMissilesLaunched += misilesDelDia;
        
        // Actualizar fragmentos y colisiones
        const F_new = this.calcularFragmentosPorMisiles(M_weekly, misilesDelDia);
        const F_decay = this.calcularDecaimientoOrbital(this.currentF_t);
        const rho_t = this.calcularDensidadFragmentos(F_decay);
        const P_collision = this.calcularProbabilidadColision(rho_t);
        const nuevasColisiones = this.calcularColisionesEsperadas(P_collision, F_decay);
        
        this.currentCollisions = nuevasColisiones;
        this.totalCollisions += nuevasColisiones;
        
        const F_collision = this.calcularFragmentosPorColisiones(nuevasColisiones);
        this.currentF_t = this.calcularFragmentosTotales(F_decay, F_new, F_collision);

        const rho_final = this.calcularDensidadFragmentos(this.currentF_t);
        const kesslerIndex = this.calcularIndiceKessler(rho_final);

        // Verificar síndrome de Kessler
        if (kesslerIndex >= 100 && !this.kesslerReached) {
            this.kesslerReached = true;
            this.kesslerStats = {
                totalMissiles: this.totalMissilesLaunched,
                kesslerDate: new Date(this.currentDate),
                daysFromStart: Math.floor((this.currentDate - new Date(this.startDate)) / (1000 * 60 * 60 * 24))
            };
        }

        const currentStats = {
            totalMissiles: this.totalMissilesLaunched,
            activeFragments: Math.floor(this.currentF_t),
            collisions: this.totalCollisions,
            kesslerIndex: Math.floor(kesslerIndex),
            kesslerReached: this.kesslerReached,
            kesslerStats: this.kesslerStats
        };

        this.currentDate.setDate(this.currentDate.getDate() + 1);
        return currentStats;
    }

    removeCountry(countryCode) {
        if (!this.countries.has(countryCode)) {
            throw new Error("País no encontrado en la simulación 💀");
        }
        this.countries.delete(countryCode);
        
        // Eliminar ataques programados del país
        this.scheduledAttacks = this.scheduledAttacks.filter(
            attack => attack.countryCode !== countryCode
        );
    }

    reset() {
        this.F_t = 0;
        this.totalMissilesLaunched = 0;
        this.totalCollisions = 0;
        this.currentF_t = 0;
        this.currentCollisions = 0;
        this.kesslerReached = false;
        this.kesslerStats = null;
        this.countries.clear();
        this.scheduledAttacks = [];
        this.currentDate = this.startDate ? new Date(this.startDate) : new Date();
        this.startDate = null;
    }
}