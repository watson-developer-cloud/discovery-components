# Contributing

## Our contribution philosophy

Discovery Components is an open source project at IBM. It is maintained by the Watson Discovery team. We strive to foster an open and inclusive development environment, and we welcome contributions from anyone who would like to submit them. Please read the guidelines below to learn more about the details of contributing to our codebase. Thank you for your interest in Discovery Components!

## Packages

Packages to which you can contribute include:
* discovery-react-components: This package includes React components that can be used with a Watson Discovery project.
* discovery-styles: This package includes all styles for the components.

## Start contributing

1. First make sure you have the [prerequisites](../README.md#prerequisites) and have completed the [development installation](../README.md#install).

4. Create a new branch off the latest `master` on which to start working. 

    ```sh
    git pull origin master
    git checkout -b {your-new-branch-name}
    ```

    When contributing, your work should always be included in a new branch.

5. Depending on which package you are contributing to, you'll want to `cd` into that package to work. So, if you are contributing to `discovery-react-components`, navigate with:

    ```sh
    cd packages/discovery-react-components
    ```

    Once inside the package in which you are contributing, you can run `yarn start` or `yarn build` to watch and build your changes as you work. In our [README](../README.md) you can find more details and [available commands](../README.md#available-commands) that are useful as you develop per package.

6. If you would like to test your changes in the `discovery-search-app` example application, you can follow the instructions included in our [README](../README.md) for Running the Example App. You can also test your changes in Storybook by running `yarn storybook` inside the `discovery-react-components` app. If you are contributing to `discovery-react-components`, please test your changes as you work by running our test commands inside the package:

    ```sh
    yarn test
    ```

## Contribution process

1. Find or open an issue. 
    * Look through the issues in the repo to see if there is already one open that covers the change you would like to contribute. If a relevant issue doesn't yet exist, open a new issue.

2. Develop. 
    * On the new branch off `master` that you created to add your contributions to, commit your work.

3. Open a pull request (PR). 
    * When submitting a PR, please fully fill out the pull request template with as much detail as possible about what you are contributing, why you are contributing it, and how to test/verify the changes. This helps us efficiently review your contribution. 
    * You will need to sign a Contributor License Agreement (CLA) that will come up when you submit the PR. 
    * Please ensure that your PR title follows the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) style as well. So, all PR titles should be prefixed with either `feat:`, `bug:`, `chore:`, `refactor:`, `docs:`, `style:`, or `test:`. 
    * Please also ensure that all tests are passing before submitting your PR for review. We use a continuous integration (CI) that will also run tests against your code and show success/failure states.
    * We also ask that you link the related issue that you found or opened for your contribution in your PR description so that we have the full context for your changes as we review your code.
    * When you open your PR, relevant codeowners should automatically be added as reviewers.

4. Get approval for your changes. 
    * For your PR to be merged into our code, we require all tests to be passing and one approval from the Watson Discovery team. Once any feedback and necessary changes have been addressed, we will then squash and merge your code into our repo.

## Developer handbook

Here we've outlined our preferred coding style choices and commit conventions that we kindly request you also follow when contributing to our repo.

### General

If you don't see something included in this section, we recommend looking around the codebase to see what is being done in other places and then following those conventions. Please also let us know and we'll be happy to look into adding more specific guidelines to this handbook.

Note that we are using [Carbon](https://www.carbondesignsystem.com/) components and styles as a foundation for much of our project and that we are therefore following Carbon's conventions in many places for consistency. This also means that if you are adding a new component, you should check Carbon first to see if a similar component to the one you are building is already included there.

### Coding style

#### Typescript

* We are using [Typescript](https://www.typescriptlang.org/) throughout our project.

##### Naming

* Variables should use `camelCase`.
* Variable names should be as descriptive as possible. We try to avoid abbreviations and very short names for const/vars, to make it easier for future developers to understand.

#### React components

##### General
* Use `<></>` fragments to wrap components so as not to add extra markup wherever possible.

##### Props

* Define default props for components and make the property optional in the interface. For example, `const MyComponent = ({ prop = 'default value'}) =>`.
* Because we are using Typescript, we don't use [propTypes](https://reactjs.org/docs/typechecking-with-proptypes.html). Instead, we ask that you define [Typescript interfaces](https://www.typescriptlang.org/docs/handbook/interfaces.html). Please don't use `any` or `object` types unless absolutely necessary, as we find it more descriptive to define concrete interfaces and types in these cases.
* For all props that define text displayed in the project, we are using one `messages` prop per component to facilitate internationalization. You can find the interface defining the `messages` prop for each component in its folder in a `messages.ts` file.

##### Hooks and function components

* We are using [React Hooks](https://reactjs.org/docs/hooks-intro.html). 
* Please use [Hooks and Function components](https://reactjs.org/docs/hooks-state.html#hooks-and-function-components) where possible.

##### Context

* We prefer using [React Context](https://reactjs.org/docs/context.html) where possible instead of passing state or context down many components. 
* Context is also helpful when communicating across sibling components.

##### Testing

* Include unit tests for all React components that include functionality beyond simple rendering. There's no need to write tests for components that just take a prop and display it on the page.
* All added features and functionality should have accompanying unit tests. Test both success and failure cases.

#### Styles

##### General

* All styles belong in the `discovery-styles` package.
* We use `.scss` Sass for styles.
* Use Carbon tokens where possible for [colors](https://www.carbondesignsystem.com/guidelines/color/usage/), [spacing](https://www.carbondesignsystem.com/guidelines/themes/#spacing), and [typography](https://www.carbondesignsystem.com/guidelines/themes/#typography).
* We use a modified [BEM syntax](http://getbem.com/naming/) for class names. For example, `bx--block__element--modifier`, where `bx` is a prefix added to prevent naming collisions.
* To style a component's root node, declare its class as `.root` in the component.
* A component's CSS classes should be defined in a `cssClasses.ts` file in the component's folder and then imported into files where they are applied to the component.

##### Units

* `padding` and `margin`: [Carbon spacing vars](https://www.carbondesignsystem.com/guidelines/themes/#spacing) or `rem` are preferred
* `width` and `height`: `rem`, `percentage`, `vh`, or `vw` are preferred, `px` if you must
* `line-height`: unitless values are preferred
* `top`, `bottom`, `right`, and `left`: `rem`, `px`, or `percentage` are preferred
* `border-width`: `px`
* `color`, `background-color`, and `fill`: [Carbon color tokens](https://www.carbondesignsystem.com/guidelines/color/usage/) are preferred

### Documentation

#### Storybook

* We use [Storybook](https://storybook.js.org/) to document components. We don't require that new components also have a Storybook, but we do encourage it and find that it's quite helpful as a visual aid of how each component works and can be utilized.
* Each component documented in Storybook has a default story. Functionality on top of the default are included in additional stories for that component.
* If you do add new or modify existing stories, we ask that you follow the patterns already established by other components. This includes a `.md` overview for each story and prop names included in parentheses behind props on the Knobs page.
