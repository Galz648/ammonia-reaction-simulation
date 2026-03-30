# ammonia-reaction-simulation

### TODO:

- [] - decouple the visualization logic of the simulation, by moving the code to
  an example > examples/
- [] - resolve the naming conflict between reactor state and simulator state,
  they are used interchangibly inside `rk4` intergrator function
- [] - create public interface for the library The reaction should be dictated
  by three equations:

- first rate equation expression (N₂ + 3H₂ ⇌ 2NH₃ <- is first rate)
- Arrhenius equation (depends on temperature (T), activation energy (E_a),
  frequency factor (A))
- Equlibrium constant K

### Examples

##### todo!

### Units

KJ for energy kelvin for temperature

### Constants

### unknowns

- how to measure concentrations?
- wrap around how to compute the reverse rate
- how to calculate the pre-exponential factor
- where does time come into play ?
- how to compute the number of moles reacted based on concentration and volume ?

### Simulation Parameters

- concentrations (N2, H2, NH3)
- temperature

### Simulation pipeline

1. Computer forward rate constant (Arrhenius Equation)
2. Compute equilibrium constant (thermodynamics)
3. Compute reverse rate constant
4. plug into rate law
5. use rate in diff equations

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run simulate.ts
```

This project was created using `bun init` in bun v1.2.19. [Bun](https://bun.com)
is a fast all-in-one JavaScript runtime.
