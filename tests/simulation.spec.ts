import type { ReactorState } from "../src/reactor";
import { updateReactorState } from "../src/simulate";
import type { SimulatorState } from "../src/simulator";


import { expect, test, describe, beforeEach } from "bun:test";

let sim_state: SimulatorState // TODO: could cause corrupted state, make sure to 

// arrhenius equation
// test function naming convention should_<expected_behavior>_when_<condition>

// describe("arrhenius_equation", () => {
//     test("should increase rate constant when temperature increases", () => {
//         // test
//         const T1 = 298
//         const T2 = 350
//         const r1 = arrhenius_equation(activation_energy_KJ, T1, frequency_factor)
//         const r2 = arrhenius_equation(activation_energy_KJ, T2, frequency_factor)

//         const rate_difference = r2 - r1 // change should be bigger than zero

//         // expect(rate_difference).toBePositive
//         expect(rate_difference).toBeGreaterThan(0)
//     })
// })

describe("Simulation", () => {
    // initial conditions
})
