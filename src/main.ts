import './style.css';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<div class="game">
  <canvas id="canvas" width="960" height="640">不支持画布</canvas>
    <div class="info">
      <p>按 [空格键] 暂停或继续</p>
    </div>
</div>
`;
// @ts-ignore
import('./index.js');
