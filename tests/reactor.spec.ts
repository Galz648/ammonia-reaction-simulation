describe("Reactor", () => {

    beforeEach(() => {
        // Reset or setup logic can go here before each test, if needed

        sim_state = {
            t: 0,
            dt: 0.001,
            dH2: 0,
            dNH3: 0,
            dN2: 0,
            dT: 0,
        }
    })
    test("should increase product concentration (forward reaction) if there is none", () => {
        // reactor initial conditions
        const initial_conditions: ReactorState = {
            N2: 1,
            H2: 3,
            NH3: 0,
            T: 700
        }

        const state = updateReactorState(sim_state, initial_conditions)

        // NH3 concentration should increase
        expect(state.NH3).toBeGreaterThan(initial_conditions.NH3)
        expect(state.H2).toBeLessThan(initial_conditions.H2)
        expect(state.N2).toBeLessThan(initial_conditions.N2)
    })
    // test("should increase reactant concentration (reverse reaction)", () => {
    //     const initial_conditions: ReactorState = {
    //         N2: 0,
    //         H2: 0,
    //         NH3: 1,
    //         T: 298
    //     }


    // })


    // test("should not change concentrations, when no reactants or products are present", () => {
    //     const initial_conditions: ReactorState = {
    //         N2: 0,
    //         H2: 0,
    //         NH3: 1,
    //         T: 298
    //     }

})

// })
