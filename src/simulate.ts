import type { ReactorState, ReactorStateArray } from "./reactor"
import { activation_energy_KJ, frequency_factor, reaction_enthalpy, volume, heat_capacity, cooling_constant, T_env, R } from "./constants"
import { arrhenius_equation, getOrThrow, type derive } from "./utils"
import { type State } from "./utils"
import type { SimulatorState } from "./simulator"


type Conditions = {
    simulator_state: SimulatorState,
    reactor_state: ReactorState

}
function arrayToState(arr: ReactorStateArray): ReactorState {
    const [N2, H2, NH3, T] = arr

    return { N2, H2, NH3, T }
}

function stateToArray(s: ReactorState): ReactorStateArray {
    return [s.N2, s.H2, s.NH3, s.T]
}


function reactionRate(k_forward: number, N2_concentration: number, H2_concentration: number, NH3_concentration: number, k_reverse: number,): number {
    const r = k_forward * N2_concentration * Math.pow(H2_concentration, 3) - k_reverse * Math.pow(NH3_concentration, 2)
    return r
}
function equilibriumConstant(deltaG_kJ: number, T: number) {
    // a thermodynamical calculation
    const R = 0.008314 // kJ/(mol·K)
    return Math.exp(-deltaG_kJ / (R * T))
}

function reactionQuotient(N2: number, H2: number, NH3: number) {
    return (NH3 ** 2) / (N2 * (H2 ** 3))
}

function deltaG(T: number) {
    // TODO: move to constants file
    const deltaH = -92 // kJ/mol
    const deltaS = -0.198 // kJ/mol·K
    return deltaH - T * deltaS
}
function derivatives(t: number, arr: State): ReactorStateArray {
    const s = arrayToState(arr as ReactorStateArray)  // TODO: "lift" transformation to the caller
    // const k_eq = Math.pow(s.NH3, 2) / (s.N2 * Math.pow(s.H2, 3))
    const dG = deltaG(s.T)
    const k_eq = Math.exp(-dG / (R * s.T))
    // const k_eq = equilibriumConstant
    const k_forward = arrhenius_equation(activation_energy_KJ, s.T, frequency_factor)
    const k_reverse = k_forward / k_eq
    const rate: number = reactionRate(k_forward, s.N2, s.H2, s.NH3, k_reverse)
    console.log({ k_forward, k_reverse, rate })
    // change in concentrations
    const dN2 = -rate
    const dH2 = -3 * rate
    const dNH3 = 2 * rate
    // change in temperature
    const dH = reaction_enthalpy * rate * volume

    const dT = ((dH) / heat_capacity) - cooling_constant * (s.T - T_env)

    const results = [dN2, dH2, dNH3, dT] as ReactorStateArray

    if (results.some(x => !Number.isFinite(x))) {
        console.log("bad derivative", { t, results })
        throw new Error("NaN in derivative")
    }
    return results
}
// simulation
export function updateReactorState(sim: SimulatorState, state: ReactorState): ReactorState {

    const state_arr = stateToArray(state)

    const reactor_state = rk4(derivatives, state_arr as State, sim.t, sim.dt)


    const s = arrayToState(reactor_state)
    return s
}


function assertValidReactorState(state: ReactorState): void {
    if (state.T < 0) {
        throw new Error("Temperature(Kelvin) cannot be smaller than zero");
    }

    if (state.N2 < 0 || state.H2 < 0 || state.NH3 < 0) throw new Error("negative concentration")
    if (![state.N2, state.H2, state.NH3, state.T].every(Number.isFinite)) throw new Error("NaN/Inf")
    // stoichiometry consistency

}
function stepHaberBoschReaction(conditions: Conditions) {


    // const state_history: { state: Conditions }[] = [{ // TODO: should be returned or accepted handled by the called
    //     state: conditions
    // }]

    const k_c = equilibriumConstant(deltaG(conditions.reactor_state.T), conditions.reactor_state.T)
    const Q = reactionQuotient(conditions.reactor_state.N2, conditions.reactor_state.H2, conditions.reactor_state.NH3)


    console.log(
        `t: ${conditions.simulator_state.t}\n` +
        `\tN2: ${conditions.reactor_state.N2}\n` +
        `\tH2: ${conditions.reactor_state.H2}\n` +
        `\tNH3: ${conditions.reactor_state.NH3}\n` +
        `\tT: ${conditions.reactor_state.T}\n` +
        `\tQ: ${Q}\n` +
        `\tk_c: ${k_c}`
    );

    conditions.reactor_state = updateReactorState(conditions.simulator_state, conditions.reactor_state)
    conditions.simulator_state = updateSimulationState(conditions.simulator_state)

    assertValidReactorState(conditions.reactor_state)
    // state_history.push({ time: sim_state.t, state })

}

enum reactionDirection {
    FORWARD,
    BACKWARD,
    EQULIBRIUM
}

function determineReactionDirection(k_c: number, Q: number): reactionDirection {
    if (k_c > Q) {
        console.log("reaction is forward")
        return reactionDirection.FORWARD
    } else if (k_c < Q) {
        console.log("reaction is reverse")
        return reactionDirection.BACKWARD
    } else {
        return reactionDirection.EQULIBRIUM
        console.log("reaction is at equilibrium")
    }
}

function updateSimulationState(sim: SimulatorState): SimulatorState {
    const new_sim_state: SimulatorState = {
        t: sim.t + sim.dt,
        dt: sim.dt,
        dH2: sim.dH2,
        dNH3: sim.dNH3,
        dN2: sim.dN2,
        dT: sim.dT,
    }
    return new_sim_state
}



export function rk4( // An implementation of the rk4 algorithm - 4th order ODE numerical
    derivative: derive,
    initial_simulation_state: State,
    t0: number,
    dt: number,
): ReactorStateArray {

    const t = t0;
    let state_arr = [...initial_simulation_state];

    const k1 = derivative(t, state_arr as State);
    const k2 = derivative(t + dt / 2, state_arr.map((yi, j) => yi + dt * getOrThrow(k1, j) / 2) as State);
    const k3 = derivative(t + dt / 2, state_arr.map((yi, j) => yi + dt * getOrThrow(k2, j) / 2) as State);
    const k4 = derivative(t + dt, state_arr.map((yi, j) => yi + dt * getOrThrow(k3, j)) as State);

    state_arr = state_arr.map(
        (yi, j) =>
            yi + (dt / 6) *
            (getOrThrow(k1, j) +
                2 * getOrThrow(k2, j) +
                2 * getOrThrow(k3, j) +
                getOrThrow(k4, j))
    );

    return [...state_arr] as ReactorStateArray;
}

export {
    stepHaberBoschReaction,
    type Conditions
}
