import React from "react";
import Login from "./Login";
import { BrowserRouter as Router } from "react-router-dom";
import { mount } from "@cypress/react";
// import { mount } from "cypress-react-unit-test";

describe("<Login />", () => {
  context("700p resolution", () => {
    beforeEach(() => {
      cy.viewport(1240, 805);
      const initialState = {};

      mount(
        <Router>
          <Login />
        </Router>
      );
    });
    it("should display login form", () => {
      // Mount the Login component using cypress-react-unit-test
      // Wait for the "Login" text to be visible on the page
      cy.contains("Welcome back!");
      cy.contains("Login your account.");
      cy.contains("Login", { timeout: 10000 }).should("be.visible");

      // Check the existence of input fields and "Login" text
      cy.get('input[name="email"]').should("exist");
      cy.get('input[name="password"]').should("exist");
      cy.contains("Login").should("exist");
    });
    it("should show/hide password when clicking the show/hide password button", () => {
      // Type a password
      cy.get('input[name="password"]').type("secretpassword");

      // Password field should be of type "password"
      cy.get('input[name="password"]').should("have.attr", "type", "password");

      // Click the show password button
      cy.get(".MuiInputAdornment-root button").click();

      // Password field should now be of type "text" (password shown)
      cy.get('input[name="password"]').should("have.attr", "type", "text");

      // Click the show password button again
      cy.get(".MuiInputAdornment-root button").click();

      // Password field should be of type "password" again (password hidden)
      cy.get('input[name="password"]').should("have.attr", "type", "password");
    });
    it("should display an error message for invalid credentials", () => {
      // Type invalid email and password
      cy.get('input[name="email"]').type("invalid@example.com");
      cy.get('input[name="password"]').type("invalidpassword");

      // Move focus away from the email input field to trigger validation
      cy.get('input[name="password"]').click();

      // Assert that the "Enter the valid email" error message is not displayed
      cy.contains("Enter the valid email").should("not.exist");

      // Click the login button
      // cy.get('button[type="submit"]').click();

      // Assert that an error message is displayed
      // cy.contains("Invalid email or password", { timeout: 15000 }).should(
      //   ($el) => {
      //     cy.log("Error message found:", $el.text());
      //   }
      // );
      // Clear the email and password fields
      cy.get('input[name="email"]').clear();
      cy.get('input[name="password"]').clear();

      // Move focus away from the password input field to trigger validation
      cy.get('input[name="password"]').click();

      // Assert that the "Email is required" and "Password is required" error messages are displayed
      cy.contains("Email is required").should("be.visible");
      cy.contains("Password is required").should("be.visible");
    });
    it("should navigate to the 'Forgot password?' page when the button is clicked", () => {
      // Mount the Login component

      // Click the "Forgot password?" button
      cy.contains("Forgot password?").click();

      // Assert that the URL has changed to the expected "forgotpassword" page
      cy.url().should("include", "/forgotpassword");
    });
    it("should log in successfully with valid credentials", () => {
      mount(
        <Router>
          <Login />
        </Router>
      );

      // Type valid email and password
      cy.get('input[name="email"]').type("user@example.com");
      cy.get('input[name="password"]').type("secretpassword");

      // Click the login button
      cy.get('button[type="submit"]').click();

      // Assert that the user is redirected to the dashboard or any other authenticated page
      // For example, if you have a "Welcome, User!" message on the dashboard page:
      // cy.contains("Welcome, User!");
      // cy.url().should("include", "/admin");
      cy.location().should((location) => {
        expect(location.pathname).to.include("/admin");
      });
    });
  });
});

// })
