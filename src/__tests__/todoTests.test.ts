import { By, WebDriver, Capabilities, Builder, until } from "selenium-webdriver";
import { elementLocated } from "selenium-webdriver/lib/until";

const driver: WebDriver = new Builder()
  .withCapabilities(Capabilities.chrome())
  .build(); 

class TodoPage {
  driver: WebDriver;
  url: string = "https://devmountain.github.io/qa_todos/";
  // What needs to be done? input locator
  todoInput: By = By.className("new-todo");
  // this locator will find ALL the todos
  allTodos: By = By.css("li.todo");
  // this locator will find the text of a todo FROM the todo
  todoLabel: By = By.css("label");
  // this locator will find the checkbox for the todo FROM the todo
  todoComplete: By = By.css("input");
  // clear completed button locator
  clearCompletedButton: By = By.css('button.clear-completed');
  // this locator finds the star on the todo
  favoriteStar: By = By.className('star');
  // this locator finds the starred todos
  favoritedStar: By = By.className('starred');
  // number of todos locator
  numTodos: By = By.className('todo-count');

  constructor(driver: WebDriver) {
    this.driver = driver;
  }
}

const td = new TodoPage(driver);


describe("the todo app", () => {
  beforeEach(async () => {
    await driver.get(td.url);
  });

  afterAll(async () => {
    await driver.quit();
  });

  it("can add a todo", async () => {
    // wait until todoInput is located
    await driver.wait(until.elementLocated(td.todoInput));

    // Add todo
    await driver.findElement(td.todoInput).sendKeys("Refill water\n");
  });
  it("can remove a todo", async () => {
    // find all todos, set to a variable for reuse
    let myTodos = await driver.findElements(td.allTodos);

    // filter to get matching todo "Refill water"
    let myTodo = await myTodos.filter(async (todo) => {
      (await (await todo.findElement(td.todoLabel)).getText()) == "Refill water";
    });
    // make sure to only have one todo
    expect(myTodo.length).toEqual(1);

    // mark it complete
    await (await myTodo[0].findElement(td.todoComplete)).click();

    // clear complete todos
    await (await driver.findElement(td.clearCompletedButton)).click();

    // get todos and filter again to confirm removal
    myTodos = await driver.findElements(td.allTodos);
    myTodo = await myTodos.filter(async (todo) => {
      (await (await todo.findElement(td.todoLabel)).getText()) == "Refill water";

    // no matching todos
    expect(myTodo.length).toEqual(0);
    })
  });
  it("can mark a todo with a star", async () => {
    // locate todo input
    await driver.wait(until.elementLocated(td.todoInput));

    // keep track of beginning stars length
    let openingStars = await (await driver.findElements(td.favoriteStar)).length;

    // add todo
    await driver.findElement(td.todoInput).sendKeys("Buy chapstick\n");

    // filter todo to find matching todo and star it
    await (await driver.findElements(td.allTodos)).filter(async(todo) => {
      (await (await todo.findElement(td.todoLabel)).getText()) == "Refill water"
    })[0].findElement(td.favoriteStar).click();

    // keep track of starred length
    let endingStars = await (await driver.findElements(td.favoritedStar)).length;

    // starred should be 1 compared to beginning of 0
    expect(openingStars).toBeLessThan(endingStars);
  });
  it("has the right number of todos listed", async () => {
    // await driver.findElement(td.todoComplete).click();

    // locate todo input
    await driver.wait(until.elementLocated(td.todoInput));

    // keep track of starting count of todos
    let startingCount = await (await driver.findElements(td.allTodos)).length;

    // add 3 todos
    await driver.findElement(td.todoInput).sendKeys("Go to the gym\n");
    await driver.findElement(td.todoInput).sendKeys("Pick up brother from school\n");
    await driver.findElement(td.todoInput).sendKeys("Buy food before going home\n");

    // keep track of ending count of todos
    let endingCount = await (await driver.findElements(td.allTodos)).length;

    // verify endingCount = numTodos locator
    let text = await (await driver.findElement(td.numTodos)).getText();

    // startingCount set equal to 1 because add todo from 
    // previous test is still there ("Refill water")
    expect(startingCount).toEqual(1);

    // verifying number of items text is equal to endingCount
    expect(text).toBe(`${endingCount} items left`)

  });
  // it("can rename a todo", async () => {
  //   await (await driver.findElements(td.allTodos)).filter(async(todo) => {
  //     (await (await driver.findElement(td.todoLabel)).getText()) == "Buy food before going home";
  //   })

  //   let old_todo = await (await driver.findElement(td.todoLabel)).getText();

  //   await (await driver.findElement(td.todoLabel[0])).clear();

  //   let text = await driver.findElement(td.todoLabel).sendKeys("Buy chipotle\n");

  //   expect(old_todo).not.toEqual(text);
  // })
});
