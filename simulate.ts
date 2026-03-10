
// constants
import { LineController, PointElement, Chart, Legend, Title, Tooltip, LineElement, LinearScale } from "chart.js"
import { activation_energy_KJ, frequency_factor, reaction_enthalpy, volume, heat_capacity, cooling_constant, T_env, R } from "./constants"
import { arrhenius_equation } from "./utils"
import { rk4, type State } from "./utils"




// State
export type ReactorStateArray = [number, number, number, number]
export type ReactorState = {
    N2: number
    H2: number
    NH3: number
    T: number,
}


export type SimulatorState = {
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
    const s = arrayToState(arr as ReactorStateArray)
    // const k_eq = Math.pow(s.NH3, 2) / (s.N2 * Math.pow(s.H2, 3))
    const dG = deltaG(s.T)
    const k_eq = Math.exp(-dG / (R * s.T))
    // const k_eq = equilibriumConstant
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
export function step(sim: SimulatorState, state: ReactorState): ReactorState {

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
        T: 700,
    }



    var state_history: { time: number, state: ReactorState }[] = []
    state_history.push({
        time: sim_state.t,
        state: state
    })

    const steps = 1000
    for (let i = 0; i < steps; i++) {
        const k_c = equilibriumConstant(deltaG(state.T), state.T)
        const Q = reactionQuotient(state.N2, state.H2, state.NH3)

        if (k_c > Q) {
            console.log("reaction is forward")
        } else if (k_c < Q) {
            console.log("reaction is reverse")
        } else {
            console.log("reaction is at equilibrium")
        }
        console.log(
            `step: ${i}\n` +
            `t: ${sim_state.t}\n` +
            `\tN2: ${state.N2}\n` +
            `\tH2: ${state.H2}\n` +
            `\tNH3: ${state.NH3}\n` +
            `\tT: ${state.T}\n` +
            `\tQ: ${Q}\n` +
            `\tk_c: ${k_c}`
        );
        sim_state.t += sim_state.dt
        state = step(sim_state, state)
        state_history.push({ time: sim_state.t, state })
        assert_valid(state)

        sim_state = update_simulation_state(sim_state)
    }
    plot_state_history(sim_state, state_history)
}
)()


function update_simulation_state(sim: SimulatorState): SimulatorState {
    return {
        t: sim.t + sim.dt,
        dt: sim.dt
    }
}

function plot_state_history(sim_state: SimulatorState, state_history: { time: number, state: ReactorState }[]): void {
    const ctx = document.getElementById("myChart") as HTMLCanvasElement;
    Chart.register(
        LineController,
        LineElement,
        PointElement,
        Title,
        Tooltip,
        Legend, LinearScale,
    );
    new Chart(ctx, {
        type: "line",

        data: {
            datasets: [{
                label: "N2",
                type: "line",
                backgroundColor: "red",
                data: state_history.map(p => ({
                    x: p.time,
                    y: p.state.N2
                })),
                borderWidth: 1,
            },
            {
                label: "H2",
                type: "line",
                backgroundColor: "blue",
                data: state_history.map(p => ({
                    x: p.time,
                    y: p.state.H2
                })),
                borderWidth: 1,
            },
            {
                label: "NH3",
                type: "line",
                backgroundColor: "green",
                data: state_history.map(p => ({
                    x: p.time,
                    y: p.state.NH3
                })),
                borderWidth: 1,
            },
            {
                label: "T",
                type: "line",
                backgroundColor: "yellow",
                data: state_history.map(p => ({
                    x: p.time,
                    y: p.state.T
                })),
                borderWidth: 1,
            }
                , {
                label: "Q",
                type: "line",
                backgroundColor: "purple",
                data: state_history.map(p => ({
                    x: p.time,
                    y: reactionQuotient(p.state.N2, p.state.H2, p.state.NH3)
                })),
                borderWidth: 1,
            }
                , {
                label: "k_c",
                data: state_history.map(p => ({
                    x: p.time,
                    y: equilibriumConstant(deltaG(p.state.T), p.state.T)
                })),
                borderWidth: 1,
            }
            ]
        },
        options: {
            parsing: false,
            scales: {
                x: { type: "linear", position: "bottom" }
            }
        }
    })
}
