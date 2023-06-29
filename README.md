[vermeer](https://github.com/danielesteban/vermeer)
==

[![vermeer](https://repository-images.githubusercontent.com/660281177/4f009e38-4dba-4a10-a944-9aa276694e9c)](https://vermeer.gatunes.com)

#### Setup pass (Runs once)

 * Load a texture
 * Render it with the [Velocity](src/shaders/velocity.ts) shader to get a velocity map
   * The velocity map stores the difference in lightness for every pixel
 * Create a color map with a random color for every dot
 * Setup two ping-pong rendertargets
 * Create a data texture with the initial positions and velocity for every dot
   * Render it into the first rendertarget


#### Compute pass (Runs every frame)

 * Render the current rendertarget texture with the [Compute](src/shaders/compute.ts) shader to get the next simulation state
   * This shader uses the velocity map to slow down the points near the bright pixels of the input image
 * Swap the rendertargets

#### Render pass (Runs every frame)

 * Render a instanced plane for every dot with the [Dots](src/shaders/dots.ts) shader
   * This shader uses the last computed simulation state and the color map to position and color the dots.
