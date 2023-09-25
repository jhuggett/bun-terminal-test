import { Shell, userInput, TargetMap, select } from "@jhuggett/terminal";

class BunShell extends Shell {
  setRaw(on: boolean): void {
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    } else {
      throw new Error("stdin is not a TTY");
    }
  }
  protected getShellSize(): { rows: number; columns: number } {
    return {
      rows: process.stdout.rows,
      columns: process.stdout.columns,
    };
  }
  protected writeToStandardOut(contents: string): void {
    process.stdout.write(contents);
  }
  protected readStandardIn(): Promise<Uint8Array> {
    this.setRaw(true);
    process.stdin.resume();

    return new Promise((resolve) => {
      return process.stdin.once("data", (data) => {
        this.setRaw(false);
        process.stdin.pause();
        resolve(data);
      });
    });
  }
  onWindowResize(onEvent: () => void): { stopListening: () => void } {
    try {
      const stopListing = process.on("SIGWINCH", onEvent);
      return { stopListening: () => {} };
    } catch (error) {
      // windows doesn't support SIGWINCH
      throw new Error("Unable to listen for SIGWINCH");
    }
  }
}

const shell = new BunShell();
shell.clear();

const main = shell.getBoxRepresentation().layer(
  select([
    [20, 10],
    [1, 1],
    [19, 9],
  ])
);

main.bufferedWriteString("Hello World!");
main.carriageReturn();
main.bufferedWriteString("Type anything... ");

shell.render();

let notDone = true;

while (notDone) {
  await userInput(
    shell,
    new TargetMap({
      "Any character": ({ key }) => {
        main.bufferedWriteString(key, {
          foregroundColor: {
            r: 200,
            g: 0,
            b: 0,
          },
        });
      },
      Enter: () => {
        notDone = false;
      },
    })
  );
  shell.render();
}

shell.render();
