
// constants
import { arrhenius_equation } from "./utils"
import { rk4, type State } from "./utils"

const delta_entropy = -0.198
const frequency_factor = Math.pow(10, 10)
const activation_energy_KJ = 250
// const catalytic_activation_energy_KJ = 90
const T_env = 298
const heat_capacity = 1.0   // kJ/K
const cooling_constant = 0.05  //  kJ/(K s)
const volume = 1 // L
const reaction_enthalpy = -46 // KJ/mol




// State
export type ReactorStateArray = [number, number, number, number]
type ReactorState = {
    N2: number
    H2: number
    NH3: number
    T: number,
}

type SimulatorState = {
    t: number,
    dt: number
}

function arrayToState(arr: ReactorStateArray): ReactorState {
    const [N2, H2, NH3, T] = arr

    return { N2, H2, NH3, T }
}

function stateToArray(s: ReactorState): number[] {
    return [s.N2, s.H2, s.NH3, s.T]
}


function reaction_rate(k_forward: number, N2_concentration: number, H2_concentration: number, NH3_concentration: number, k_reverse: number,): number {
    const r = k_forward * N2_concentration * Math.pow(H2_concentration, 3) - k_reverse * Math.pow(NH3_concentration, 2)
    return r
}

function derivatives(t: number, arr: State): ReactorStateArray {
    const s = arrayToState(arr as ReactorStateArray)
    const k_eq = Math.pow(s.NH3, 2) / (s.N2 * Math.pow(s.H2, 3))
    const k_forward = arrhenius_equation(activation_energy_KJ, s.T, frequency_factor)
    const k_reverse = k_forward / k_eq
    const rate: number = reaction_rate(k_forward, s.H2, s.H2, s.NH3, k_reverse)
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
function step(sim: SimulatorState, state: ReactorState): ReactorState {

    let y = stateToArray(state)

    const new_state = rk4(derivatives, y, sim.t, sim.dt)


    const s = arrayToState(new_state) // TODO: move the tranformation to the caller
    return s
}


function assert_valid(state: ReactorState): void {
    if (state.T < 0) {
        throw new Error("Temperature(Kelvin) cannot be smaller than zero");
    }

    // 
}
(function game_loop() {
    var sim_state: SimulatorState = {
        t: 0,
        dt: 0.01
    }
    // initial conditions
    var state: ReactorState = {
        N2: 1.0,
        H2: 3.0,
        NH3: 0.0,
        T: 298,
    }

    const steps = 3
    for (let i = 0; i < steps; i++) {
        console.log(
            `step: ${i}\n` +
            `t: ${sim_state.t}\n` +
            `\tN2: ${state.N2}\n` +
            `\tH2: ${state.H2}\n` +
            `\tNH3: ${state.NH3}\n` +
            `\tT: ${state.T}`
        );
        sim_state.t += sim_state.dt

        state = step(sim_state, state)

        assert_valid(state)

        console.log(
            `step: ${i}\n` +
            `t: ${sim_state.t}\n` +
            `\tN2: ${state.N2}\n` +
            `\tH2: ${state.H2}\n` +
            `\tNH3: ${state.NH3}\n` +
            `\tT: ${state.T}`
        );
        sim_state.t += sim_state.dt
    }
}
)()
