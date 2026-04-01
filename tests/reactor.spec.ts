import type { ReactorState } from "../src/reactor"
import { updateReactorState } from "../src/simulate"
import type { SimulatorState } from "../src/simulator"
describe("Reactor", () => {

    describe("Steady states", () => {
        describe("Trivial Steady States", () => {

            test("temperature remains unchanged at equilibrium without heat input", () => {
                const initial_conditions: ReactorState = {
                    N2: 0,
                    H2: 0,
                    NH3: 0,
                    T: 298
                }

                const sim_state: SimulatorState = {
                    t: 0,
                    dt: 0.001,
                    dH2: 0,
                    dNH3: 0,
                    dN2: 0,
                    dT: 0,
                }

                const state = updateReactorState({
                    reactor_state: initial_conditions,
                    simulator_state: sim_state,
                    controls: { heat_input: 0 }
                })

                expect(state.T).toBe(initial_conditions.T)
            })
        })

        describe("Non-Trivial Steady States", () => {
            test("temperature remains unchanged at reaction equilibrium without heat input", () => {
                const initial_conditions: ReactorState = { // TODO: determine if this is actually a steady state
                    N2: 1,
                    H2: 3,
                    NH3: 2,
                    T: 298
                }

                const sim_state: SimulatorState = {
                    t: 0,
                    dt: 0.001,
                    dH2: 0,
                    dNH3: 0,
                    dN2: 0,
                    dT: 0,
                }

                const state = updateReactorState({
                    reactor_state: initial_conditions,
                    simulator_state: sim_state,
                    controls: { heat_input: 0 }
                })

                expect(state.T).toBe(initial_conditions.T)
                expect(state.N2).toBe(initial_conditions.N2)
                expect(state.H2).toBe(initial_conditions.H2)

            })
        })
        // // 

        describe("Invariants", () => {
            test("concentrations remain unchanged with no reactants or products", () => {
                const initial_conditions: ReactorState = {
                    N2: 0,
                    H2: 0,
                    NH3: 0,
                    T: 298
                }

                const sim_state: SimulatorState = {
                    t: 0,
                    dt: 0.001,
                    dH2: 0,
                    dNH3: 0,
                    dN2: 0,
                    dT: 0,
                }

                const state = updateReactorState({
                    reactor_state: initial_conditions,
                    simulator_state: sim_state,
                    controls: { heat_input: 0 }
                })

                expect(state.N2).toBe(initial_conditions.N2)
                expect(state.H2).toBe(initial_conditions.H2)
                expect(state.NH3).toBe(initial_conditions.NH3)
                expect(state.T).toBe(initial_conditions.T)
            })


            test("temperature remains unchanged at equilibrium without heat input", () => {
                const initial_conditions: ReactorState = {
                    N2: 0,
                    H2: 0,
                    NH3: 0,
                    T: 298
                }

                const sim_state: SimulatorState = {
                    t: 0,
                    dt: 0.001,
                    dH2: 0,
                    dNH3: 0,
                    dN2: 0,
                    dT: 0,
                }

                const state = updateReactorState({
                    reactor_state: initial_conditions,
                    simulator_state: sim_state,
                    controls: { heat_input: 0 }
                })

                expect(state.T).toBe(initial_conditions.T)
            })
        })


        describe("Reaction Dynamics", () => {
            describe("Forward Reaction", () => {
                test("increases product concentration in forward reaction", () => { // TODO: problematic assumption that the forward rate occurs
                    const initial_conditions: ReactorState = {
                        N2: 1,
                        H2: 3,
                        NH3: 0,
                        T: 700
                    }

                    const sim_state: SimulatorState = {
                        t: 0,
                        dt: 0.001,
                        dH2: 0,
                        dNH3: 0,
                        dN2: 0,
                        dT: 0,
                    }

                    const state = updateReactorState({
                        reactor_state: initial_conditions,
                        simulator_state: sim_state,
                        controls: { heat_input: 0 }
                    })

                    expect(state.NH3).toBeGreaterThan(initial_conditions.NH3)
                    expect(state.H2).toBeLessThan(initial_conditions.H2)
                    expect(state.N2).toBeLessThan(initial_conditions.N2)
                })
            })
            describe("Backward Reaction", () => {
                test("decreases product concentration in backward reaction", () => {
                    const initial_conditions: ReactorState = {
                        N2: 0,
                        H2: 0,
                        NH3: 1,
                        T: 700
                    }
                    const sim_state: SimulatorState = {
                        t: 0,
                        dt: 0.001,
                        dH2: 0,
                        dNH3: 0,
                        dN2: 0,
                        dT: 0,
                    }
                    const state = updateReactorState({
                        reactor_state: initial_conditions,
                        simulator_state: sim_state,
                        controls: { heat_input: 0 }
                    })

                    expect(state.N2).toBeGreaterThan(initial_conditions.N2)
                    expect(state.H2).toBeGreaterThan(initial_conditions.H2)
                    expect(state.NH3).toBeLessThan(initial_conditions.NH3)
                })
                // placeholder for symmetry
                // test("increases reactant concentration in reverse reaction", ...)
            })
        })


        describe("Control Effects", () => {
            describe("Heat Input", () => {
                test("temperature increases with heat input", () => {
                    const initial_conditions: ReactorState = {
                        N2: 0,
                        H2: 0,
                        NH3: 0,
                        T: 700
                    }

                    const sim_state: SimulatorState = {
                        t: 0,
                        dt: 0.001,
                        dH2: 0,
                        dNH3: 0,
                        dN2: 0,
                        dT: 0,
                    }

                    const state = updateReactorState({
                        reactor_state: initial_conditions,
                        simulator_state: sim_state,
                        controls: { heat_input: 100 }
                    })

                    expect(state.T).toBeGreaterThan(initial_conditions.T)
                })
            })
            test("temperature decreases without heat input, when temperature is above equilibrium, and no reaction occurs", () => {
                const initial_conditions: ReactorState = {
                    N2: 0,
                    H2: 0,
                    NH3: 0,
                    T: 300
                }

                const sim_state: SimulatorState = {
                    t: 0,
                    dt: 0.001,
                    dH2: 0,
                    dNH3: 0,
                    dN2: 0,
                    dT: 0,
                }

                const state = updateReactorState({
                    reactor_state: initial_conditions,
                    simulator_state: sim_state,
                    controls: { heat_input: 0 }
                })

                expect(state.T).toBeLessThan(initial_conditions.T)
            })
        })

    })
})
