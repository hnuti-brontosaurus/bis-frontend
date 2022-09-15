import { emptySplitApi as api } from './emptyApi'
const injectedRtkApi = api.injectEndpoints({
  endpoints: build => ({
    authLoginCreate: build.mutation<
      AuthLoginCreateApiResponse,
      AuthLoginCreateApiArg
    >({
      query: queryArg => ({
        url: `/api/auth/login/`,
        method: 'POST',
        body: queryArg.loginRequest,
      }),
    }),
    authResetPasswordCreate: build.mutation<
      AuthResetPasswordCreateApiResponse,
      AuthResetPasswordCreateApiArg
    >({
      query: queryArg => ({
        url: `/api/auth/reset_password/`,
        method: 'POST',
        body: queryArg.resetPasswordRequest,
      }),
    }),
    authSendVerificationLinkCreate: build.mutation<
      AuthSendVerificationLinkCreateApiResponse,
      AuthSendVerificationLinkCreateApiArg
    >({
      query: queryArg => ({
        url: `/api/auth/send_verification_link/`,
        method: 'POST',
        body: queryArg.sendVerificationLinkRequest,
      }),
    }),
    authWhoamiRetrieve: build.query<
      AuthWhoamiRetrieveApiResponse,
      AuthWhoamiRetrieveApiArg
    >({
      query: () => ({ url: `/api/auth/whoami/` }),
    }),
    categoriesAdministrationUnitCategoriesList: build.query<
      CategoriesAdministrationUnitCategoriesListApiResponse,
      CategoriesAdministrationUnitCategoriesListApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/administration_unit_categories/`,
        params: { ordering: queryArg.ordering, page: queryArg.page },
      }),
    }),
    categoriesAdministrationUnitCategoriesRetrieve: build.query<
      CategoriesAdministrationUnitCategoriesRetrieveApiResponse,
      CategoriesAdministrationUnitCategoriesRetrieveApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/administration_unit_categories/${queryArg.id}/`,
      }),
    }),
    categoriesDietCategoriesList: build.query<
      CategoriesDietCategoriesListApiResponse,
      CategoriesDietCategoriesListApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/diet_categories/`,
        params: { ordering: queryArg.ordering, page: queryArg.page },
      }),
    }),
    categoriesDietCategoriesRetrieve: build.query<
      CategoriesDietCategoriesRetrieveApiResponse,
      CategoriesDietCategoriesRetrieveApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/diet_categories/${queryArg.id}/`,
      }),
    }),
    categoriesDonationSourceCategoriesList: build.query<
      CategoriesDonationSourceCategoriesListApiResponse,
      CategoriesDonationSourceCategoriesListApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/donation_source_categories/`,
        params: { ordering: queryArg.ordering, page: queryArg.page },
      }),
    }),
    categoriesDonationSourceCategoriesRetrieve: build.query<
      CategoriesDonationSourceCategoriesRetrieveApiResponse,
      CategoriesDonationSourceCategoriesRetrieveApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/donation_source_categories/${queryArg.id}/`,
      }),
    }),
    categoriesEventCategoriesList: build.query<
      CategoriesEventCategoriesListApiResponse,
      CategoriesEventCategoriesListApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/event_categories/`,
        params: { ordering: queryArg.ordering, page: queryArg.page },
      }),
    }),
    categoriesEventCategoriesRetrieve: build.query<
      CategoriesEventCategoriesRetrieveApiResponse,
      CategoriesEventCategoriesRetrieveApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/event_categories/${queryArg.id}/`,
      }),
    }),
    categoriesEventGroupCategoriesList: build.query<
      CategoriesEventGroupCategoriesListApiResponse,
      CategoriesEventGroupCategoriesListApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/event_group_categories/`,
        params: { ordering: queryArg.ordering, page: queryArg.page },
      }),
    }),
    categoriesEventGroupCategoriesRetrieve: build.query<
      CategoriesEventGroupCategoriesRetrieveApiResponse,
      CategoriesEventGroupCategoriesRetrieveApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/event_group_categories/${queryArg.id}/`,
      }),
    }),
    categoriesEventProgramCategoriesList: build.query<
      CategoriesEventProgramCategoriesListApiResponse,
      CategoriesEventProgramCategoriesListApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/event_program_categories/`,
        params: { ordering: queryArg.ordering, page: queryArg.page },
      }),
    }),
    categoriesEventProgramCategoriesRetrieve: build.query<
      CategoriesEventProgramCategoriesRetrieveApiResponse,
      CategoriesEventProgramCategoriesRetrieveApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/event_program_categories/${queryArg.id}/`,
      }),
    }),
    categoriesGrantCategoriesList: build.query<
      CategoriesGrantCategoriesListApiResponse,
      CategoriesGrantCategoriesListApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/grant_categories/`,
        params: { ordering: queryArg.ordering, page: queryArg.page },
      }),
    }),
    categoriesGrantCategoriesRetrieve: build.query<
      CategoriesGrantCategoriesRetrieveApiResponse,
      CategoriesGrantCategoriesRetrieveApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/grant_categories/${queryArg.id}/`,
      }),
    }),
    categoriesHealthInsuranceCompaniesList: build.query<
      CategoriesHealthInsuranceCompaniesListApiResponse,
      CategoriesHealthInsuranceCompaniesListApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/health_insurance_companies/`,
        params: { ordering: queryArg.ordering, page: queryArg.page },
      }),
    }),
    categoriesHealthInsuranceCompaniesRetrieve: build.query<
      CategoriesHealthInsuranceCompaniesRetrieveApiResponse,
      CategoriesHealthInsuranceCompaniesRetrieveApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/health_insurance_companies/${queryArg.id}/`,
      }),
    }),
    categoriesLocationAccessibilityCategoriesList: build.query<
      CategoriesLocationAccessibilityCategoriesListApiResponse,
      CategoriesLocationAccessibilityCategoriesListApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/location_accessibility_categories/`,
        params: { ordering: queryArg.ordering, page: queryArg.page },
      }),
    }),
    categoriesLocationAccessibilityCategoriesRetrieve: build.query<
      CategoriesLocationAccessibilityCategoriesRetrieveApiResponse,
      CategoriesLocationAccessibilityCategoriesRetrieveApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/location_accessibility_categories/${queryArg.id}/`,
      }),
    }),
    categoriesLocationProgramCategoriesList: build.query<
      CategoriesLocationProgramCategoriesListApiResponse,
      CategoriesLocationProgramCategoriesListApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/location_program_categories/`,
        params: { ordering: queryArg.ordering, page: queryArg.page },
      }),
    }),
    categoriesLocationProgramCategoriesRetrieve: build.query<
      CategoriesLocationProgramCategoriesRetrieveApiResponse,
      CategoriesLocationProgramCategoriesRetrieveApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/location_program_categories/${queryArg.id}/`,
      }),
    }),
    categoriesMembershipCategoriesList: build.query<
      CategoriesMembershipCategoriesListApiResponse,
      CategoriesMembershipCategoriesListApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/membership_categories/`,
        params: { ordering: queryArg.ordering, page: queryArg.page },
      }),
    }),
    categoriesMembershipCategoriesRetrieve: build.query<
      CategoriesMembershipCategoriesRetrieveApiResponse,
      CategoriesMembershipCategoriesRetrieveApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/membership_categories/${queryArg.id}/`,
      }),
    }),
    categoriesOpportunityCategoriesList: build.query<
      CategoriesOpportunityCategoriesListApiResponse,
      CategoriesOpportunityCategoriesListApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/opportunity_categories/`,
        params: { ordering: queryArg.ordering, page: queryArg.page },
      }),
    }),
    categoriesOpportunityCategoriesRetrieve: build.query<
      CategoriesOpportunityCategoriesRetrieveApiResponse,
      CategoriesOpportunityCategoriesRetrieveApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/opportunity_categories/${queryArg.id}/`,
      }),
    }),
    categoriesOrganizerRoleCategoriesList: build.query<
      CategoriesOrganizerRoleCategoriesListApiResponse,
      CategoriesOrganizerRoleCategoriesListApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/organizer_role_categories/`,
        params: { ordering: queryArg.ordering, page: queryArg.page },
      }),
    }),
    categoriesOrganizerRoleCategoriesRetrieve: build.query<
      CategoriesOrganizerRoleCategoriesRetrieveApiResponse,
      CategoriesOrganizerRoleCategoriesRetrieveApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/organizer_role_categories/${queryArg.id}/`,
      }),
    }),
    categoriesPropagationIntendedForCategoriesList: build.query<
      CategoriesPropagationIntendedForCategoriesListApiResponse,
      CategoriesPropagationIntendedForCategoriesListApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/propagation_intended_for_categories/`,
        params: { ordering: queryArg.ordering, page: queryArg.page },
      }),
    }),
    categoriesPropagationIntendedForCategoriesRetrieve: build.query<
      CategoriesPropagationIntendedForCategoriesRetrieveApiResponse,
      CategoriesPropagationIntendedForCategoriesRetrieveApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/propagation_intended_for_categories/${queryArg.id}/`,
      }),
    }),
    categoriesQualificationCategoriesList: build.query<
      CategoriesQualificationCategoriesListApiResponse,
      CategoriesQualificationCategoriesListApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/qualification_categories/`,
        params: { ordering: queryArg.ordering, page: queryArg.page },
      }),
    }),
    categoriesQualificationCategoriesRetrieve: build.query<
      CategoriesQualificationCategoriesRetrieveApiResponse,
      CategoriesQualificationCategoriesRetrieveApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/qualification_categories/${queryArg.id}/`,
      }),
    }),
    categoriesRegionsList: build.query<
      CategoriesRegionsListApiResponse,
      CategoriesRegionsListApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/regions/`,
        params: { ordering: queryArg.ordering, page: queryArg.page },
      }),
    }),
    categoriesRegionsRetrieve: build.query<
      CategoriesRegionsRetrieveApiResponse,
      CategoriesRegionsRetrieveApiArg
    >({
      query: queryArg => ({ url: `/api/categories/regions/${queryArg.id}/` }),
    }),
    categoriesRoleCategoriesList: build.query<
      CategoriesRoleCategoriesListApiResponse,
      CategoriesRoleCategoriesListApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/role_categories/`,
        params: { ordering: queryArg.ordering, page: queryArg.page },
      }),
    }),
    categoriesRoleCategoriesRetrieve: build.query<
      CategoriesRoleCategoriesRetrieveApiResponse,
      CategoriesRoleCategoriesRetrieveApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/role_categories/${queryArg.id}/`,
      }),
    }),
    categoriesSexCategoriesList: build.query<
      CategoriesSexCategoriesListApiResponse,
      CategoriesSexCategoriesListApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/sex_categories/`,
        params: { ordering: queryArg.ordering, page: queryArg.page },
      }),
    }),
    categoriesSexCategoriesRetrieve: build.query<
      CategoriesSexCategoriesRetrieveApiResponse,
      CategoriesSexCategoriesRetrieveApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/sex_categories/${queryArg.id}/`,
      }),
    }),
    categoriesTeamRoleCategoriesList: build.query<
      CategoriesTeamRoleCategoriesListApiResponse,
      CategoriesTeamRoleCategoriesListApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/team_role_categories/`,
        params: { ordering: queryArg.ordering, page: queryArg.page },
      }),
    }),
    categoriesTeamRoleCategoriesRetrieve: build.query<
      CategoriesTeamRoleCategoriesRetrieveApiResponse,
      CategoriesTeamRoleCategoriesRetrieveApiArg
    >({
      query: queryArg => ({
        url: `/api/categories/team_role_categories/${queryArg.id}/`,
      }),
    }),
    frontendEventsList: build.query<
      FrontendEventsListApiResponse,
      FrontendEventsListApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/`,
        params: {
          id: queryArg.id,
          ordering: queryArg.ordering,
          page: queryArg.page,
        },
      }),
    }),
    frontendEventsCreate: build.mutation<
      FrontendEventsCreateApiResponse,
      FrontendEventsCreateApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/`,
        method: 'POST',
        body: queryArg.event,
      }),
    }),
    frontendEventsFinanceReceiptsList: build.query<
      FrontendEventsFinanceReceiptsListApiResponse,
      FrontendEventsFinanceReceiptsListApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.eventId}/finance/receipts/`,
        params: { ordering: queryArg.ordering, page: queryArg.page },
      }),
    }),
    frontendEventsFinanceReceiptsCreate: build.mutation<
      FrontendEventsFinanceReceiptsCreateApiResponse,
      FrontendEventsFinanceReceiptsCreateApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.eventId}/finance/receipts/`,
        method: 'POST',
        body: queryArg.financeReceipt,
      }),
    }),
    frontendEventsFinanceReceiptsRetrieve: build.query<
      FrontendEventsFinanceReceiptsRetrieveApiResponse,
      FrontendEventsFinanceReceiptsRetrieveApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.eventId}/finance/receipts/${queryArg.id}/`,
      }),
    }),
    frontendEventsFinanceReceiptsUpdate: build.mutation<
      FrontendEventsFinanceReceiptsUpdateApiResponse,
      FrontendEventsFinanceReceiptsUpdateApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.eventId}/finance/receipts/${queryArg.id}/`,
        method: 'PUT',
        body: queryArg.financeReceipt,
      }),
    }),
    frontendEventsFinanceReceiptsPartialUpdate: build.mutation<
      FrontendEventsFinanceReceiptsPartialUpdateApiResponse,
      FrontendEventsFinanceReceiptsPartialUpdateApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.eventId}/finance/receipts/${queryArg.id}/`,
        method: 'PATCH',
        body: queryArg.patchedFinanceReceipt,
      }),
    }),
    frontendEventsFinanceReceiptsDestroy: build.mutation<
      FrontendEventsFinanceReceiptsDestroyApiResponse,
      FrontendEventsFinanceReceiptsDestroyApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.eventId}/finance/receipts/${queryArg.id}/`,
        method: 'DELETE',
      }),
    }),
    frontendEventsOrganizersList: build.query<
      FrontendEventsOrganizersListApiResponse,
      FrontendEventsOrganizersListApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.eventId}/organizers/`,
        params: {
          id: queryArg.id,
          ordering: queryArg.ordering,
          page: queryArg.page,
        },
      }),
    }),
    frontendEventsOrganizersRetrieve: build.query<
      FrontendEventsOrganizersRetrieveApiResponse,
      FrontendEventsOrganizersRetrieveApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.eventId}/organizers/${queryArg.id}/`,
      }),
    }),
    frontendEventsPropagationImagesList: build.query<
      FrontendEventsPropagationImagesListApiResponse,
      FrontendEventsPropagationImagesListApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.eventId}/propagation/images/`,
        params: { ordering: queryArg.ordering, page: queryArg.page },
      }),
    }),
    frontendEventsPropagationImagesCreate: build.mutation<
      FrontendEventsPropagationImagesCreateApiResponse,
      FrontendEventsPropagationImagesCreateApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.eventId}/propagation/images/`,
        method: 'POST',
        body: queryArg.eventPropagationImage,
      }),
    }),
    frontendEventsPropagationImagesRetrieve: build.query<
      FrontendEventsPropagationImagesRetrieveApiResponse,
      FrontendEventsPropagationImagesRetrieveApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.eventId}/propagation/images/${queryArg.id}/`,
      }),
    }),
    frontendEventsPropagationImagesUpdate: build.mutation<
      FrontendEventsPropagationImagesUpdateApiResponse,
      FrontendEventsPropagationImagesUpdateApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.eventId}/propagation/images/${queryArg.id}/`,
        method: 'PUT',
        body: queryArg.eventPropagationImage,
      }),
    }),
    frontendEventsPropagationImagesPartialUpdate: build.mutation<
      FrontendEventsPropagationImagesPartialUpdateApiResponse,
      FrontendEventsPropagationImagesPartialUpdateApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.eventId}/propagation/images/${queryArg.id}/`,
        method: 'PATCH',
        body: queryArg.patchedEventPropagationImage,
      }),
    }),
    frontendEventsPropagationImagesDestroy: build.mutation<
      FrontendEventsPropagationImagesDestroyApiResponse,
      FrontendEventsPropagationImagesDestroyApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.eventId}/propagation/images/${queryArg.id}/`,
        method: 'DELETE',
      }),
    }),
    frontendEventsRecordParticipantsList: build.query<
      FrontendEventsRecordParticipantsListApiResponse,
      FrontendEventsRecordParticipantsListApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.eventId}/record/participants/`,
        params: {
          id: queryArg.id,
          ordering: queryArg.ordering,
          page: queryArg.page,
        },
      }),
    }),
    frontendEventsRecordParticipantsRetrieve: build.query<
      FrontendEventsRecordParticipantsRetrieveApiResponse,
      FrontendEventsRecordParticipantsRetrieveApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.eventId}/record/participants/${queryArg.id}/`,
      }),
    }),
    frontendEventsRecordPhotosList: build.query<
      FrontendEventsRecordPhotosListApiResponse,
      FrontendEventsRecordPhotosListApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.eventId}/record/photos/`,
        params: { ordering: queryArg.ordering, page: queryArg.page },
      }),
    }),
    frontendEventsRecordPhotosCreate: build.mutation<
      FrontendEventsRecordPhotosCreateApiResponse,
      FrontendEventsRecordPhotosCreateApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.eventId}/record/photos/`,
        method: 'POST',
        body: queryArg.eventPhoto,
      }),
    }),
    frontendEventsRecordPhotosRetrieve: build.query<
      FrontendEventsRecordPhotosRetrieveApiResponse,
      FrontendEventsRecordPhotosRetrieveApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.eventId}/record/photos/${queryArg.id}/`,
      }),
    }),
    frontendEventsRecordPhotosUpdate: build.mutation<
      FrontendEventsRecordPhotosUpdateApiResponse,
      FrontendEventsRecordPhotosUpdateApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.eventId}/record/photos/${queryArg.id}/`,
        method: 'PUT',
        body: queryArg.eventPhoto,
      }),
    }),
    frontendEventsRecordPhotosPartialUpdate: build.mutation<
      FrontendEventsRecordPhotosPartialUpdateApiResponse,
      FrontendEventsRecordPhotosPartialUpdateApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.eventId}/record/photos/${queryArg.id}/`,
        method: 'PATCH',
        body: queryArg.patchedEventPhoto,
      }),
    }),
    frontendEventsRecordPhotosDestroy: build.mutation<
      FrontendEventsRecordPhotosDestroyApiResponse,
      FrontendEventsRecordPhotosDestroyApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.eventId}/record/photos/${queryArg.id}/`,
        method: 'DELETE',
      }),
    }),
    frontendEventsRegisteredList: build.query<
      FrontendEventsRegisteredListApiResponse,
      FrontendEventsRegisteredListApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.eventId}/registered/`,
        params: {
          id: queryArg.id,
          ordering: queryArg.ordering,
          page: queryArg.page,
        },
      }),
    }),
    frontendEventsRegisteredRetrieve: build.query<
      FrontendEventsRegisteredRetrieveApiResponse,
      FrontendEventsRegisteredRetrieveApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.eventId}/registered/${queryArg.id}/`,
      }),
    }),
    frontendEventsRegistrationApplicationsList: build.query<
      FrontendEventsRegistrationApplicationsListApiResponse,
      FrontendEventsRegistrationApplicationsListApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.eventId}/registration/applications/`,
        params: { ordering: queryArg.ordering, page: queryArg.page },
      }),
    }),
    frontendEventsRegistrationApplicationsCreate: build.mutation<
      FrontendEventsRegistrationApplicationsCreateApiResponse,
      FrontendEventsRegistrationApplicationsCreateApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.eventId}/registration/applications/`,
        method: 'POST',
        body: queryArg.eventApplication,
      }),
    }),
    frontendEventsRegistrationApplicationsRetrieve: build.query<
      FrontendEventsRegistrationApplicationsRetrieveApiResponse,
      FrontendEventsRegistrationApplicationsRetrieveApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.eventId}/registration/applications/${queryArg.id}/`,
      }),
    }),
    frontendEventsRegistrationApplicationsUpdate: build.mutation<
      FrontendEventsRegistrationApplicationsUpdateApiResponse,
      FrontendEventsRegistrationApplicationsUpdateApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.eventId}/registration/applications/${queryArg.id}/`,
        method: 'PUT',
        body: queryArg.eventApplication,
      }),
    }),
    frontendEventsRegistrationApplicationsPartialUpdate: build.mutation<
      FrontendEventsRegistrationApplicationsPartialUpdateApiResponse,
      FrontendEventsRegistrationApplicationsPartialUpdateApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.eventId}/registration/applications/${queryArg.id}/`,
        method: 'PATCH',
        body: queryArg.patchedEventApplication,
      }),
    }),
    frontendEventsRegistrationApplicationsDestroy: build.mutation<
      FrontendEventsRegistrationApplicationsDestroyApiResponse,
      FrontendEventsRegistrationApplicationsDestroyApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.eventId}/registration/applications/${queryArg.id}/`,
        method: 'DELETE',
      }),
    }),
    frontendEventsRegistrationQuestionnaireQuestionsList: build.query<
      FrontendEventsRegistrationQuestionnaireQuestionsListApiResponse,
      FrontendEventsRegistrationQuestionnaireQuestionsListApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.eventId}/registration/questionnaire/questions/`,
        params: { ordering: queryArg.ordering, page: queryArg.page },
      }),
    }),
    frontendEventsRegistrationQuestionnaireQuestionsCreate: build.mutation<
      FrontendEventsRegistrationQuestionnaireQuestionsCreateApiResponse,
      FrontendEventsRegistrationQuestionnaireQuestionsCreateApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.eventId}/registration/questionnaire/questions/`,
        method: 'POST',
        body: queryArg.question,
      }),
    }),
    frontendEventsRegistrationQuestionnaireQuestionsRetrieve: build.query<
      FrontendEventsRegistrationQuestionnaireQuestionsRetrieveApiResponse,
      FrontendEventsRegistrationQuestionnaireQuestionsRetrieveApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.eventId}/registration/questionnaire/questions/${queryArg.id}/`,
      }),
    }),
    frontendEventsRegistrationQuestionnaireQuestionsUpdate: build.mutation<
      FrontendEventsRegistrationQuestionnaireQuestionsUpdateApiResponse,
      FrontendEventsRegistrationQuestionnaireQuestionsUpdateApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.eventId}/registration/questionnaire/questions/${queryArg.id}/`,
        method: 'PUT',
        body: queryArg.question,
      }),
    }),
    frontendEventsRegistrationQuestionnaireQuestionsPartialUpdate:
      build.mutation<
        FrontendEventsRegistrationQuestionnaireQuestionsPartialUpdateApiResponse,
        FrontendEventsRegistrationQuestionnaireQuestionsPartialUpdateApiArg
      >({
        query: queryArg => ({
          url: `/api/frontend/events/${queryArg.eventId}/registration/questionnaire/questions/${queryArg.id}/`,
          method: 'PATCH',
          body: queryArg.patchedQuestion,
        }),
      }),
    frontendEventsRegistrationQuestionnaireQuestionsDestroy: build.mutation<
      FrontendEventsRegistrationQuestionnaireQuestionsDestroyApiResponse,
      FrontendEventsRegistrationQuestionnaireQuestionsDestroyApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.eventId}/registration/questionnaire/questions/${queryArg.id}/`,
        method: 'DELETE',
      }),
    }),
    frontendEventsRetrieve: build.query<
      FrontendEventsRetrieveApiResponse,
      FrontendEventsRetrieveApiArg
    >({
      query: queryArg => ({ url: `/api/frontend/events/${queryArg.id}/` }),
    }),
    frontendEventsUpdate: build.mutation<
      FrontendEventsUpdateApiResponse,
      FrontendEventsUpdateApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.id}/`,
        method: 'PUT',
        body: queryArg.event,
      }),
    }),
    frontendEventsPartialUpdate: build.mutation<
      FrontendEventsPartialUpdateApiResponse,
      FrontendEventsPartialUpdateApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.id}/`,
        method: 'PATCH',
        body: queryArg.patchedEvent,
      }),
    }),
    frontendEventsDestroy: build.mutation<
      FrontendEventsDestroyApiResponse,
      FrontendEventsDestroyApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/events/${queryArg.id}/`,
        method: 'DELETE',
      }),
    }),
    frontendLocationsList: build.query<
      FrontendLocationsListApiResponse,
      FrontendLocationsListApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/locations/`,
        params: {
          id: queryArg.id,
          ordering: queryArg.ordering,
          page: queryArg.page,
        },
      }),
    }),
    frontendLocationsCreate: build.mutation<
      FrontendLocationsCreateApiResponse,
      FrontendLocationsCreateApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/locations/`,
        method: 'POST',
        body: queryArg.location,
      }),
    }),
    frontendLocationsRetrieve: build.query<
      FrontendLocationsRetrieveApiResponse,
      FrontendLocationsRetrieveApiArg
    >({
      query: queryArg => ({ url: `/api/frontend/locations/${queryArg.id}/` }),
    }),
    frontendLocationsUpdate: build.mutation<
      FrontendLocationsUpdateApiResponse,
      FrontendLocationsUpdateApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/locations/${queryArg.id}/`,
        method: 'PUT',
        body: queryArg.location,
      }),
    }),
    frontendLocationsPartialUpdate: build.mutation<
      FrontendLocationsPartialUpdateApiResponse,
      FrontendLocationsPartialUpdateApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/locations/${queryArg.id}/`,
        method: 'PATCH',
        body: queryArg.patchedLocation,
      }),
    }),
    frontendLocationsDestroy: build.mutation<
      FrontendLocationsDestroyApiResponse,
      FrontendLocationsDestroyApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/locations/${queryArg.id}/`,
        method: 'DELETE',
      }),
    }),
    frontendUsersList: build.query<
      FrontendUsersListApiResponse,
      FrontendUsersListApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/users/`,
        params: {
          id: queryArg.id,
          ordering: queryArg.ordering,
          page: queryArg.page,
        },
      }),
    }),
    frontendUsersCreate: build.mutation<
      FrontendUsersCreateApiResponse,
      FrontendUsersCreateApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/users/`,
        method: 'POST',
        body: queryArg.user,
      }),
    }),
    frontendUsersRetrieve: build.query<
      FrontendUsersRetrieveApiResponse,
      FrontendUsersRetrieveApiArg
    >({
      query: queryArg => ({ url: `/api/frontend/users/${queryArg.id}/` }),
    }),
    frontendUsersUpdate: build.mutation<
      FrontendUsersUpdateApiResponse,
      FrontendUsersUpdateApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/users/${queryArg.id}/`,
        method: 'PUT',
        body: queryArg.user,
      }),
    }),
    frontendUsersPartialUpdate: build.mutation<
      FrontendUsersPartialUpdateApiResponse,
      FrontendUsersPartialUpdateApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/users/${queryArg.id}/`,
        method: 'PATCH',
        body: queryArg.patchedUser,
      }),
    }),
    frontendUsersDestroy: build.mutation<
      FrontendUsersDestroyApiResponse,
      FrontendUsersDestroyApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/users/${queryArg.id}/`,
        method: 'DELETE',
      }),
    }),
    frontendUsersEventsWhereWasOrganizerList: build.query<
      FrontendUsersEventsWhereWasOrganizerListApiResponse,
      FrontendUsersEventsWhereWasOrganizerListApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/users/${queryArg.userId}/events_where_was_organizer/`,
        params: {
          id: queryArg.id,
          ordering: queryArg.ordering,
          page: queryArg.page,
        },
      }),
    }),
    frontendUsersEventsWhereWasOrganizerRetrieve: build.query<
      FrontendUsersEventsWhereWasOrganizerRetrieveApiResponse,
      FrontendUsersEventsWhereWasOrganizerRetrieveApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/users/${queryArg.userId}/events_where_was_organizer/${queryArg.id}/`,
      }),
    }),
    frontendUsersOpportunitiesList: build.query<
      FrontendUsersOpportunitiesListApiResponse,
      FrontendUsersOpportunitiesListApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/users/${queryArg.userId}/opportunities/`,
        params: { ordering: queryArg.ordering, page: queryArg.page },
      }),
    }),
    frontendUsersOpportunitiesCreate: build.mutation<
      FrontendUsersOpportunitiesCreateApiResponse,
      FrontendUsersOpportunitiesCreateApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/users/${queryArg.userId}/opportunities/`,
        method: 'POST',
        body: queryArg.opportunity,
      }),
    }),
    frontendUsersOpportunitiesRetrieve: build.query<
      FrontendUsersOpportunitiesRetrieveApiResponse,
      FrontendUsersOpportunitiesRetrieveApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/users/${queryArg.userId}/opportunities/${queryArg.id}/`,
      }),
    }),
    frontendUsersOpportunitiesUpdate: build.mutation<
      FrontendUsersOpportunitiesUpdateApiResponse,
      FrontendUsersOpportunitiesUpdateApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/users/${queryArg.userId}/opportunities/${queryArg.id}/`,
        method: 'PUT',
        body: queryArg.opportunity,
      }),
    }),
    frontendUsersOpportunitiesPartialUpdate: build.mutation<
      FrontendUsersOpportunitiesPartialUpdateApiResponse,
      FrontendUsersOpportunitiesPartialUpdateApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/users/${queryArg.userId}/opportunities/${queryArg.id}/`,
        method: 'PATCH',
        body: queryArg.patchedOpportunity,
      }),
    }),
    frontendUsersOpportunitiesDestroy: build.mutation<
      FrontendUsersOpportunitiesDestroyApiResponse,
      FrontendUsersOpportunitiesDestroyApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/users/${queryArg.userId}/opportunities/${queryArg.id}/`,
        method: 'DELETE',
      }),
    }),
    frontendUsersParticipatedInEventsList: build.query<
      FrontendUsersParticipatedInEventsListApiResponse,
      FrontendUsersParticipatedInEventsListApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/users/${queryArg.userId}/participated_in_events/`,
        params: {
          id: queryArg.id,
          ordering: queryArg.ordering,
          page: queryArg.page,
        },
      }),
    }),
    frontendUsersParticipatedInEventsRetrieve: build.query<
      FrontendUsersParticipatedInEventsRetrieveApiResponse,
      FrontendUsersParticipatedInEventsRetrieveApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/users/${queryArg.userId}/participated_in_events/${queryArg.id}/`,
      }),
    }),
    frontendUsersRegisteredInEventsList: build.query<
      FrontendUsersRegisteredInEventsListApiResponse,
      FrontendUsersRegisteredInEventsListApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/users/${queryArg.userId}/registered_in_events/`,
        params: {
          id: queryArg.id,
          ordering: queryArg.ordering,
          page: queryArg.page,
        },
      }),
    }),
    frontendUsersRegisteredInEventsRetrieve: build.query<
      FrontendUsersRegisteredInEventsRetrieveApiResponse,
      FrontendUsersRegisteredInEventsRetrieveApiArg
    >({
      query: queryArg => ({
        url: `/api/frontend/users/${queryArg.userId}/registered_in_events/${queryArg.id}/`,
      }),
    }),
    webAdministrationUnitsList: build.query<
      WebAdministrationUnitsListApiResponse,
      WebAdministrationUnitsListApiArg
    >({
      query: queryArg => ({
        url: `/api/web/administration_units/`,
        params: {
          category: queryArg.category,
          ordering: queryArg.ordering,
          page: queryArg.page,
        },
      }),
    }),
    webAdministrationUnitsRetrieve: build.query<
      WebAdministrationUnitsRetrieveApiResponse,
      WebAdministrationUnitsRetrieveApiArg
    >({
      query: queryArg => ({
        url: `/api/web/administration_units/${queryArg.id}/`,
      }),
    }),
    webEventsList: build.query<WebEventsListApiResponse, WebEventsListApiArg>({
      query: queryArg => ({
        url: `/api/web/events/`,
        params: {
          administration_unit: queryArg.administrationUnit,
          category: queryArg.category,
          duration: queryArg.duration,
          duration__gte: queryArg.durationGte,
          duration__lte: queryArg.durationLte,
          group: queryArg.group,
          intended_for: queryArg.intendedFor,
          ordering: queryArg.ordering,
          page: queryArg.page,
          program: queryArg.program,
        },
      }),
    }),
    webEventsRetrieve: build.query<
      WebEventsRetrieveApiResponse,
      WebEventsRetrieveApiArg
    >({
      query: queryArg => ({ url: `/api/web/events/${queryArg.id}/` }),
    }),
    webOpportunitiesList: build.query<
      WebOpportunitiesListApiResponse,
      WebOpportunitiesListApiArg
    >({
      query: queryArg => ({
        url: `/api/web/opportunities/`,
        params: {
          category: queryArg.category,
          ordering: queryArg.ordering,
          page: queryArg.page,
        },
      }),
    }),
    webOpportunitiesRetrieve: build.query<
      WebOpportunitiesRetrieveApiResponse,
      WebOpportunitiesRetrieveApiArg
    >({
      query: queryArg => ({ url: `/api/web/opportunities/${queryArg.id}/` }),
    }),
  }),
  overrideExisting: false,
})
export { injectedRtkApi as testApi }
export type AuthLoginCreateApiResponse = /** status 200  */ TokenResponse
export type AuthLoginCreateApiArg = {
  loginRequest: LoginRequest
}
export type AuthResetPasswordCreateApiResponse =
  /** status 200  */ TokenResponse
export type AuthResetPasswordCreateApiArg = {
  resetPasswordRequest: ResetPasswordRequest
}
export type AuthSendVerificationLinkCreateApiResponse = unknown
export type AuthSendVerificationLinkCreateApiArg = {
  sendVerificationLinkRequest: SendVerificationLinkRequest
}
export type AuthWhoamiRetrieveApiResponse = /** status 200  */ UserIdResponse
export type AuthWhoamiRetrieveApiArg = void
export type CategoriesAdministrationUnitCategoriesListApiResponse =
  /** status 200  */ PaginatedAdministrationUnitCategoryList
export type CategoriesAdministrationUnitCategoriesListApiArg = {
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
}
export type CategoriesAdministrationUnitCategoriesRetrieveApiResponse =
  /** status 200  */ AdministrationUnitCategory
export type CategoriesAdministrationUnitCategoriesRetrieveApiArg = {
  /** A unique integer value identifying this Typ organizující jednotky. */
  id: number
}
export type CategoriesDietCategoriesListApiResponse =
  /** status 200  */ PaginatedDietCategoryList
export type CategoriesDietCategoriesListApiArg = {
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
}
export type CategoriesDietCategoriesRetrieveApiResponse =
  /** status 200  */ DietCategory
export type CategoriesDietCategoriesRetrieveApiArg = {
  /** A unique integer value identifying this Typ stravy. */
  id: number
}
export type CategoriesDonationSourceCategoriesListApiResponse =
  /** status 200  */ PaginatedDonationSourceCategoryList
export type CategoriesDonationSourceCategoriesListApiArg = {
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
}
export type CategoriesDonationSourceCategoriesRetrieveApiResponse =
  /** status 200  */ DonationSourceCategory
export type CategoriesDonationSourceCategoriesRetrieveApiArg = {
  /** A unique integer value identifying this Zdroj dotace. */
  id: number
}
export type CategoriesEventCategoriesListApiResponse =
  /** status 200  */ PaginatedEventCategoryList
export type CategoriesEventCategoriesListApiArg = {
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
}
export type CategoriesEventCategoriesRetrieveApiResponse =
  /** status 200  */ EventCategory
export type CategoriesEventCategoriesRetrieveApiArg = {
  /** A unique integer value identifying this Typ akce. */
  id: number
}
export type CategoriesEventGroupCategoriesListApiResponse =
  /** status 200  */ PaginatedEventGroupCategoryList
export type CategoriesEventGroupCategoriesListApiArg = {
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
}
export type CategoriesEventGroupCategoriesRetrieveApiResponse =
  /** status 200  */ EventGroupCategory
export type CategoriesEventGroupCategoriesRetrieveApiArg = {
  /** A unique integer value identifying this Druh akce. */
  id: number
}
export type CategoriesEventProgramCategoriesListApiResponse =
  /** status 200  */ PaginatedEventProgramCategoryList
export type CategoriesEventProgramCategoriesListApiArg = {
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
}
export type CategoriesEventProgramCategoriesRetrieveApiResponse =
  /** status 200  */ EventProgramCategory
export type CategoriesEventProgramCategoriesRetrieveApiArg = {
  /** A unique integer value identifying this Program akce. */
  id: number
}
export type CategoriesGrantCategoriesListApiResponse =
  /** status 200  */ PaginatedGrantCategoryList
export type CategoriesGrantCategoriesListApiArg = {
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
}
export type CategoriesGrantCategoriesRetrieveApiResponse =
  /** status 200  */ GrantCategory
export type CategoriesGrantCategoriesRetrieveApiArg = {
  /** A unique integer value identifying this Typ grantu. */
  id: number
}
export type CategoriesHealthInsuranceCompaniesListApiResponse =
  /** status 200  */ PaginatedHealthInsuranceCompanyList
export type CategoriesHealthInsuranceCompaniesListApiArg = {
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
}
export type CategoriesHealthInsuranceCompaniesRetrieveApiResponse =
  /** status 200  */ HealthInsuranceCompany
export type CategoriesHealthInsuranceCompaniesRetrieveApiArg = {
  /** A unique integer value identifying this Zdravotní pojišťovna. */
  id: number
}
export type CategoriesLocationAccessibilityCategoriesListApiResponse =
  /** status 200  */ PaginatedLocationAccessibilityCategoryList
export type CategoriesLocationAccessibilityCategoriesListApiArg = {
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
}
export type CategoriesLocationAccessibilityCategoriesRetrieveApiResponse =
  /** status 200  */ LocationAccessibilityCategory
export type CategoriesLocationAccessibilityCategoriesRetrieveApiArg = {
  /** A unique integer value identifying this Dostupnost lokality. */
  id: number
}
export type CategoriesLocationProgramCategoriesListApiResponse =
  /** status 200  */ PaginatedLocationProgramCategoryList
export type CategoriesLocationProgramCategoriesListApiArg = {
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
}
export type CategoriesLocationProgramCategoriesRetrieveApiResponse =
  /** status 200  */ LocationProgramCategory
export type CategoriesLocationProgramCategoriesRetrieveApiArg = {
  /** A unique integer value identifying this Program lokality. */
  id: number
}
export type CategoriesMembershipCategoriesListApiResponse =
  /** status 200  */ PaginatedMembershipCategoryList
export type CategoriesMembershipCategoriesListApiArg = {
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
}
export type CategoriesMembershipCategoriesRetrieveApiResponse =
  /** status 200  */ MembershipCategory
export type CategoriesMembershipCategoriesRetrieveApiArg = {
  /** A unique integer value identifying this Členství. */
  id: number
}
export type CategoriesOpportunityCategoriesListApiResponse =
  /** status 200  */ PaginatedOpportunityCategoryList
export type CategoriesOpportunityCategoriesListApiArg = {
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
}
export type CategoriesOpportunityCategoriesRetrieveApiResponse =
  /** status 200  */ OpportunityCategory
export type CategoriesOpportunityCategoriesRetrieveApiArg = {
  /** A unique integer value identifying this Kagegorie příležitosti. */
  id: number
}
export type CategoriesOrganizerRoleCategoriesListApiResponse =
  /** status 200  */ PaginatedOrganizerRoleCategoryList
export type CategoriesOrganizerRoleCategoriesListApiArg = {
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
}
export type CategoriesOrganizerRoleCategoriesRetrieveApiResponse =
  /** status 200  */ OrganizerRoleCategory
export type CategoriesOrganizerRoleCategoriesRetrieveApiArg = {
  /** A unique integer value identifying this Organizátorská role. */
  id: number
}
export type CategoriesPropagationIntendedForCategoriesListApiResponse =
  /** status 200  */ PaginatedPropagationIntendedForCategoryList
export type CategoriesPropagationIntendedForCategoriesListApiArg = {
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
}
export type CategoriesPropagationIntendedForCategoriesRetrieveApiResponse =
  /** status 200  */ PropagationIntendedForCategory
export type CategoriesPropagationIntendedForCategoriesRetrieveApiArg = {
  /** A unique integer value identifying this Kategorie zaměření propagace. */
  id: number
}
export type CategoriesQualificationCategoriesListApiResponse =
  /** status 200  */ PaginatedQualificationCategoryList
export type CategoriesQualificationCategoriesListApiArg = {
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
}
export type CategoriesQualificationCategoriesRetrieveApiResponse =
  /** status 200  */ QualificationCategory
export type CategoriesQualificationCategoriesRetrieveApiArg = {
  /** A unique integer value identifying this Typ kvalifikace. */
  id: number
}
export type CategoriesRegionsListApiResponse =
  /** status 200  */ PaginatedRegionList
export type CategoriesRegionsListApiArg = {
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
}
export type CategoriesRegionsRetrieveApiResponse = /** status 200  */ Region
export type CategoriesRegionsRetrieveApiArg = {
  /** A unique integer value identifying this Kraj. */
  id: number
}
export type CategoriesRoleCategoriesListApiResponse =
  /** status 200  */ PaginatedRoleCategoryList
export type CategoriesRoleCategoriesListApiArg = {
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
}
export type CategoriesRoleCategoriesRetrieveApiResponse =
  /** status 200  */ RoleCategory
export type CategoriesRoleCategoriesRetrieveApiArg = {
  /** A unique integer value identifying this Typ role. */
  id: number
}
export type CategoriesSexCategoriesListApiResponse =
  /** status 200  */ PaginatedSexCategoryList
export type CategoriesSexCategoriesListApiArg = {
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
}
export type CategoriesSexCategoriesRetrieveApiResponse =
  /** status 200  */ SexCategory
export type CategoriesSexCategoriesRetrieveApiArg = {
  /** A unique integer value identifying this Pohlaví. */
  id: number
}
export type CategoriesTeamRoleCategoriesListApiResponse =
  /** status 200  */ PaginatedTeamRoleCategoryList
export type CategoriesTeamRoleCategoriesListApiArg = {
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
}
export type CategoriesTeamRoleCategoriesRetrieveApiResponse =
  /** status 200  */ TeamRoleCategory
export type CategoriesTeamRoleCategoriesRetrieveApiArg = {
  /** A unique integer value identifying this Týmová role. */
  id: number
}
export type FrontendEventsListApiResponse =
  /** status 200  */ PaginatedEventList
export type FrontendEventsListApiArg = {
  /** Více hodnot lze oddělit čárkami. */
  id?: number[]
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
}
export type FrontendEventsCreateApiResponse = /** status 201  */ Event
export type FrontendEventsCreateApiArg = {
  event: Event
}
export type FrontendEventsFinanceReceiptsListApiResponse =
  /** status 200  */ PaginatedFinanceReceiptList
export type FrontendEventsFinanceReceiptsListApiArg = {
  eventId: string
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
}
export type FrontendEventsFinanceReceiptsCreateApiResponse =
  /** status 201  */ FinanceReceipt
export type FrontendEventsFinanceReceiptsCreateApiArg = {
  eventId: string
  financeReceipt: FinanceReceipt
}
export type FrontendEventsFinanceReceiptsRetrieveApiResponse =
  /** status 200  */ FinanceReceipt
export type FrontendEventsFinanceReceiptsRetrieveApiArg = {
  eventId: string
  /** A unique integer value identifying this Účtenka. */
  id: number
}
export type FrontendEventsFinanceReceiptsUpdateApiResponse =
  /** status 200  */ FinanceReceipt
export type FrontendEventsFinanceReceiptsUpdateApiArg = {
  eventId: string
  /** A unique integer value identifying this Účtenka. */
  id: number
  financeReceipt: FinanceReceipt
}
export type FrontendEventsFinanceReceiptsPartialUpdateApiResponse =
  /** status 200  */ FinanceReceipt
export type FrontendEventsFinanceReceiptsPartialUpdateApiArg = {
  eventId: string
  /** A unique integer value identifying this Účtenka. */
  id: number
  patchedFinanceReceipt: PatchedFinanceReceipt
}
export type FrontendEventsFinanceReceiptsDestroyApiResponse = unknown
export type FrontendEventsFinanceReceiptsDestroyApiArg = {
  eventId: string
  /** A unique integer value identifying this Účtenka. */
  id: number
}
export type FrontendEventsOrganizersListApiResponse =
  /** status 200  */ PaginatedUserList
export type FrontendEventsOrganizersListApiArg = {
  eventId: string
  /** Více hodnot lze oddělit čárkami. */
  id?: number[]
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
}
export type FrontendEventsOrganizersRetrieveApiResponse =
  /** status 200  */ User
export type FrontendEventsOrganizersRetrieveApiArg = {
  eventId: string
  /** A unique integer value identifying this Uživatel. */
  id: number
}
export type FrontendEventsPropagationImagesListApiResponse =
  /** status 200  */ PaginatedEventPropagationImageList
export type FrontendEventsPropagationImagesListApiArg = {
  eventId: string
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
}
export type FrontendEventsPropagationImagesCreateApiResponse =
  /** status 201  */ EventPropagationImage
export type FrontendEventsPropagationImagesCreateApiArg = {
  eventId: string
  eventPropagationImage: EventPropagationImage
}
export type FrontendEventsPropagationImagesRetrieveApiResponse =
  /** status 200  */ EventPropagationImage
export type FrontendEventsPropagationImagesRetrieveApiArg = {
  eventId: string
  /** A unique integer value identifying this Obrázek k propagaci. */
  id: number
}
export type FrontendEventsPropagationImagesUpdateApiResponse =
  /** status 200  */ EventPropagationImage
export type FrontendEventsPropagationImagesUpdateApiArg = {
  eventId: string
  /** A unique integer value identifying this Obrázek k propagaci. */
  id: number
  eventPropagationImage: EventPropagationImage
}
export type FrontendEventsPropagationImagesPartialUpdateApiResponse =
  /** status 200  */ EventPropagationImage
export type FrontendEventsPropagationImagesPartialUpdateApiArg = {
  eventId: string
  /** A unique integer value identifying this Obrázek k propagaci. */
  id: number
  patchedEventPropagationImage: PatchedEventPropagationImage
}
export type FrontendEventsPropagationImagesDestroyApiResponse = unknown
export type FrontendEventsPropagationImagesDestroyApiArg = {
  eventId: string
  /** A unique integer value identifying this Obrázek k propagaci. */
  id: number
}
export type FrontendEventsRecordParticipantsListApiResponse =
  /** status 200  */ PaginatedUserList
export type FrontendEventsRecordParticipantsListApiArg = {
  eventId: string
  /** Více hodnot lze oddělit čárkami. */
  id?: number[]
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
}
export type FrontendEventsRecordParticipantsRetrieveApiResponse =
  /** status 200  */ User
export type FrontendEventsRecordParticipantsRetrieveApiArg = {
  eventId: string
  /** A unique integer value identifying this Uživatel. */
  id: number
}
export type FrontendEventsRecordPhotosListApiResponse =
  /** status 200  */ PaginatedEventPhotoList
export type FrontendEventsRecordPhotosListApiArg = {
  eventId: string
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
}
export type FrontendEventsRecordPhotosCreateApiResponse =
  /** status 201  */ EventPhoto
export type FrontendEventsRecordPhotosCreateApiArg = {
  eventId: string
  eventPhoto: EventPhoto
}
export type FrontendEventsRecordPhotosRetrieveApiResponse =
  /** status 200  */ EventPhoto
export type FrontendEventsRecordPhotosRetrieveApiArg = {
  eventId: string
  /** A unique integer value identifying this Fotka z akce. */
  id: number
}
export type FrontendEventsRecordPhotosUpdateApiResponse =
  /** status 200  */ EventPhoto
export type FrontendEventsRecordPhotosUpdateApiArg = {
  eventId: string
  /** A unique integer value identifying this Fotka z akce. */
  id: number
  eventPhoto: EventPhoto
}
export type FrontendEventsRecordPhotosPartialUpdateApiResponse =
  /** status 200  */ EventPhoto
export type FrontendEventsRecordPhotosPartialUpdateApiArg = {
  eventId: string
  /** A unique integer value identifying this Fotka z akce. */
  id: number
  patchedEventPhoto: PatchedEventPhoto
}
export type FrontendEventsRecordPhotosDestroyApiResponse = unknown
export type FrontendEventsRecordPhotosDestroyApiArg = {
  eventId: string
  /** A unique integer value identifying this Fotka z akce. */
  id: number
}
export type FrontendEventsRegisteredListApiResponse =
  /** status 200  */ PaginatedUserList
export type FrontendEventsRegisteredListApiArg = {
  eventId: string
  /** Více hodnot lze oddělit čárkami. */
  id?: number[]
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
}
export type FrontendEventsRegisteredRetrieveApiResponse =
  /** status 200  */ User
export type FrontendEventsRegisteredRetrieveApiArg = {
  eventId: string
  /** A unique integer value identifying this Uživatel. */
  id: number
}
export type FrontendEventsRegistrationApplicationsListApiResponse =
  /** status 200  */ PaginatedEventApplicationList
export type FrontendEventsRegistrationApplicationsListApiArg = {
  eventId: string
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
}
export type FrontendEventsRegistrationApplicationsCreateApiResponse =
  /** status 201  */ EventApplication
export type FrontendEventsRegistrationApplicationsCreateApiArg = {
  eventId: string
  eventApplication: EventApplication
}
export type FrontendEventsRegistrationApplicationsRetrieveApiResponse =
  /** status 200  */ EventApplication
export type FrontendEventsRegistrationApplicationsRetrieveApiArg = {
  eventId: string
  /** A unique integer value identifying this Přihláška na akci. */
  id: number
}
export type FrontendEventsRegistrationApplicationsUpdateApiResponse =
  /** status 200  */ EventApplication
export type FrontendEventsRegistrationApplicationsUpdateApiArg = {
  eventId: string
  /** A unique integer value identifying this Přihláška na akci. */
  id: number
  eventApplication: EventApplication
}
export type FrontendEventsRegistrationApplicationsPartialUpdateApiResponse =
  /** status 200  */ EventApplication
export type FrontendEventsRegistrationApplicationsPartialUpdateApiArg = {
  eventId: string
  /** A unique integer value identifying this Přihláška na akci. */
  id: number
  patchedEventApplication: PatchedEventApplication
}
export type FrontendEventsRegistrationApplicationsDestroyApiResponse = unknown
export type FrontendEventsRegistrationApplicationsDestroyApiArg = {
  eventId: string
  /** A unique integer value identifying this Přihláška na akci. */
  id: number
}
export type FrontendEventsRegistrationQuestionnaireQuestionsListApiResponse =
  /** status 200  */ PaginatedQuestionList
export type FrontendEventsRegistrationQuestionnaireQuestionsListApiArg = {
  eventId: string
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
}
export type FrontendEventsRegistrationQuestionnaireQuestionsCreateApiResponse =
  /** status 201  */ Question
export type FrontendEventsRegistrationQuestionnaireQuestionsCreateApiArg = {
  eventId: string
  question: Question
}
export type FrontendEventsRegistrationQuestionnaireQuestionsRetrieveApiResponse =
  /** status 200  */ Question
export type FrontendEventsRegistrationQuestionnaireQuestionsRetrieveApiArg = {
  eventId: string
  /** A unique integer value identifying this Otázka dotazníku. */
  id: number
}
export type FrontendEventsRegistrationQuestionnaireQuestionsUpdateApiResponse =
  /** status 200  */ Question
export type FrontendEventsRegistrationQuestionnaireQuestionsUpdateApiArg = {
  eventId: string
  /** A unique integer value identifying this Otázka dotazníku. */
  id: number
  question: Question
}
export type FrontendEventsRegistrationQuestionnaireQuestionsPartialUpdateApiResponse =
  /** status 200  */ Question
export type FrontendEventsRegistrationQuestionnaireQuestionsPartialUpdateApiArg =
  {
    eventId: string
    /** A unique integer value identifying this Otázka dotazníku. */
    id: number
    patchedQuestion: PatchedQuestion
  }
export type FrontendEventsRegistrationQuestionnaireQuestionsDestroyApiResponse =
  unknown
export type FrontendEventsRegistrationQuestionnaireQuestionsDestroyApiArg = {
  eventId: string
  /** A unique integer value identifying this Otázka dotazníku. */
  id: number
}
export type FrontendEventsRetrieveApiResponse = /** status 200  */ Event
export type FrontendEventsRetrieveApiArg = {
  /** A unique integer value identifying this Událost. */
  id: number
}
export type FrontendEventsUpdateApiResponse = /** status 200  */ Event
export type FrontendEventsUpdateApiArg = {
  /** A unique integer value identifying this Událost. */
  id: number
  event: Event
}
export type FrontendEventsPartialUpdateApiResponse = /** status 200  */ Event
export type FrontendEventsPartialUpdateApiArg = {
  /** A unique integer value identifying this Událost. */
  id: number
  patchedEvent: PatchedEvent
}
export type FrontendEventsDestroyApiResponse = unknown
export type FrontendEventsDestroyApiArg = {
  /** A unique integer value identifying this Událost. */
  id: number
}
export type FrontendLocationsListApiResponse =
  /** status 200  */ PaginatedLocationList
export type FrontendLocationsListApiArg = {
  /** Více hodnot lze oddělit čárkami. */
  id?: number[]
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
}
export type FrontendLocationsCreateApiResponse = /** status 201  */ Location
export type FrontendLocationsCreateApiArg = {
  location: Location
}
export type FrontendLocationsRetrieveApiResponse = /** status 200  */ Location
export type FrontendLocationsRetrieveApiArg = {
  /** A unique integer value identifying this Lokalita. */
  id: number
}
export type FrontendLocationsUpdateApiResponse = /** status 200  */ Location
export type FrontendLocationsUpdateApiArg = {
  /** A unique integer value identifying this Lokalita. */
  id: number
  location: Location
}
export type FrontendLocationsPartialUpdateApiResponse =
  /** status 200  */ Location
export type FrontendLocationsPartialUpdateApiArg = {
  /** A unique integer value identifying this Lokalita. */
  id: number
  patchedLocation: PatchedLocation
}
export type FrontendLocationsDestroyApiResponse = unknown
export type FrontendLocationsDestroyApiArg = {
  /** A unique integer value identifying this Lokalita. */
  id: number
}
export type FrontendUsersListApiResponse = /** status 200  */ PaginatedUserList
export type FrontendUsersListApiArg = {
  /** Více hodnot lze oddělit čárkami. */
  id?: number[]
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
}
export type FrontendUsersCreateApiResponse = /** status 201  */ User
export type FrontendUsersCreateApiArg = {
  user: User
}
export type FrontendUsersRetrieveApiResponse = /** status 200  */ User
export type FrontendUsersRetrieveApiArg = {
  /** A unique integer value identifying this Uživatel. */
  id: number
}
export type FrontendUsersUpdateApiResponse = /** status 200  */ User
export type FrontendUsersUpdateApiArg = {
  /** A unique integer value identifying this Uživatel. */
  id: number
  user: User
}
export type FrontendUsersPartialUpdateApiResponse = /** status 200  */ User
export type FrontendUsersPartialUpdateApiArg = {
  /** A unique integer value identifying this Uživatel. */
  id: number
  patchedUser: PatchedUser
}
export type FrontendUsersDestroyApiResponse = unknown
export type FrontendUsersDestroyApiArg = {
  /** A unique integer value identifying this Uživatel. */
  id: number
}
export type FrontendUsersEventsWhereWasOrganizerListApiResponse =
  /** status 200  */ PaginatedEventList
export type FrontendUsersEventsWhereWasOrganizerListApiArg = {
  /** Více hodnot lze oddělit čárkami. */
  id?: number[]
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
  userId: string
}
export type FrontendUsersEventsWhereWasOrganizerRetrieveApiResponse =
  /** status 200  */ Event
export type FrontendUsersEventsWhereWasOrganizerRetrieveApiArg = {
  /** A unique integer value identifying this Událost. */
  id: number
  userId: string
}
export type FrontendUsersOpportunitiesListApiResponse =
  /** status 200  */ PaginatedOpportunityList
export type FrontendUsersOpportunitiesListApiArg = {
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
  userId: string
}
export type FrontendUsersOpportunitiesCreateApiResponse =
  /** status 201  */ Opportunity
export type FrontendUsersOpportunitiesCreateApiArg = {
  userId: string
  opportunity: Opportunity
}
export type FrontendUsersOpportunitiesRetrieveApiResponse =
  /** status 200  */ Opportunity
export type FrontendUsersOpportunitiesRetrieveApiArg = {
  /** A unique integer value identifying this Příležitost. */
  id: number
  userId: string
}
export type FrontendUsersOpportunitiesUpdateApiResponse =
  /** status 200  */ Opportunity
export type FrontendUsersOpportunitiesUpdateApiArg = {
  /** A unique integer value identifying this Příležitost. */
  id: number
  userId: string
  opportunity: Opportunity
}
export type FrontendUsersOpportunitiesPartialUpdateApiResponse =
  /** status 200  */ Opportunity
export type FrontendUsersOpportunitiesPartialUpdateApiArg = {
  /** A unique integer value identifying this Příležitost. */
  id: number
  userId: string
  patchedOpportunity: PatchedOpportunity
}
export type FrontendUsersOpportunitiesDestroyApiResponse = unknown
export type FrontendUsersOpportunitiesDestroyApiArg = {
  /** A unique integer value identifying this Příležitost. */
  id: number
  userId: string
}
export type FrontendUsersParticipatedInEventsListApiResponse =
  /** status 200  */ PaginatedEventList
export type FrontendUsersParticipatedInEventsListApiArg = {
  /** Více hodnot lze oddělit čárkami. */
  id?: number[]
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
  userId: string
}
export type FrontendUsersParticipatedInEventsRetrieveApiResponse =
  /** status 200  */ Event
export type FrontendUsersParticipatedInEventsRetrieveApiArg = {
  /** A unique integer value identifying this Událost. */
  id: number
  userId: string
}
export type FrontendUsersRegisteredInEventsListApiResponse =
  /** status 200  */ PaginatedEventList
export type FrontendUsersRegisteredInEventsListApiArg = {
  /** Více hodnot lze oddělit čárkami. */
  id?: number[]
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
  userId: string
}
export type FrontendUsersRegisteredInEventsRetrieveApiResponse =
  /** status 200  */ Event
export type FrontendUsersRegisteredInEventsRetrieveApiArg = {
  /** A unique integer value identifying this Událost. */
  id: number
  userId: string
}
export type WebAdministrationUnitsListApiResponse =
  /** status 200  */ PaginatedAdministrationUnitList
export type WebAdministrationUnitsListApiArg = {
  /** Více hodnot lze oddělit čárkami. */
  category?: ('basic_section' | 'club' | 'headquarter' | 'regional_center')[]
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
}
export type WebAdministrationUnitsRetrieveApiResponse =
  /** status 200  */ AdministrationUnit
export type WebAdministrationUnitsRetrieveApiArg = {
  /** A unique integer value identifying this Organizující jednotka. */
  id: number
}
export type WebEventsListApiResponse = /** status 200  */ PaginatedEventList
export type WebEventsListApiArg = {
  /** Více hodnot lze oddělit čárkami. */
  administrationUnit?: (
    | 1
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15
    | 16
    | 17
    | 18
    | 19
    | 2
    | 20
    | 21
    | 22
    | 23
    | 24
    | 25
    | 26
    | 27
    | 28
    | 29
    | 3
    | 30
    | 31
    | 32
    | 33
    | 34
    | 35
    | 36
    | 37
    | 38
    | 39
    | 4
    | 40
    | 41
    | 42
    | 43
    | 44
    | 45
    | 46
    | 47
    | 48
    | 49
    | 5
    | 50
    | 51
    | 52
    | 53
    | 54
    | 55
    | 56
    | 57
    | 58
    | 59
    | 6
    | 60
    | 61
    | 62
    | 63
    | 64
    | 65
    | 66
    | 67
    | 68
    | 69
    | 7
    | 70
    | 71
    | 72
    | 73
    | 74
    | 75
    | 76
    | 77
    | 78
    | 79
    | 8
    | 80
    | 81
    | 82
    | 83
    | 84
    | 85
    | 86
    | 87
    | 88
    | 89
    | 9
  )[]
  /** Více hodnot lze oddělit čárkami. */
  category?: (
    | 'internal__general_meeting'
    | 'internal__section_meeting'
    | 'internal__volunteer_meeting'
    | 'public__club__lecture'
    | 'public__club__meeting'
    | 'public__educational__course'
    | 'public__educational__educational'
    | 'public__educational__educational_with_stay'
    | 'public__educational__lecture'
    | 'public__educational__ohb'
    | 'public__only_experiential'
    | 'public__other__eco_tent'
    | 'public__other__exhibition'
    | 'public__other__for_public'
    | 'public__sports'
    | 'public__volunteering__only_volunteering'
    | 'public__volunteering__with_experience'
  )[]
  duration?: number
  durationGte?: number
  durationLte?: number
  /** Více hodnot lze oddělit čárkami. */
  group?: ('camp' | 'other' | 'weekend_event')[]
  /** Více hodnot lze oddělit čárkami. */
  intendedFor?: (
    | 'for_all'
    | 'for_first_time_participant'
    | 'for_kids'
    | 'for_parents_with_kids'
    | 'for_young_and_adult'
  )[]
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
  /** Více hodnot lze oddělit čárkami. */
  program?: (
    | 'eco_tent'
    | 'education'
    | 'holidays_with_brontosaurus'
    | 'international'
    | 'kids'
    | 'monuments'
    | 'nature'
    | 'none'
  )[]
}
export type WebEventsRetrieveApiResponse = /** status 200  */ Event
export type WebEventsRetrieveApiArg = {
  /** A unique integer value identifying this Událost. */
  id: number
}
export type WebOpportunitiesListApiResponse =
  /** status 200  */ PaginatedOpportunityList
export type WebOpportunitiesListApiArg = {
  /** Více hodnot lze oddělit čárkami. */
  category?: ('collaboration' | 'location_help' | 'organizing')[]
  /** Which field to use when ordering the results. */
  ordering?: string
  /** A page number within the paginated result set. */
  page?: number
}
export type WebOpportunitiesRetrieveApiResponse = /** status 200  */ Opportunity
export type WebOpportunitiesRetrieveApiArg = {
  /** A unique integer value identifying this Příležitost. */
  id: number
}
export type TokenResponse = {
  token: string
}
export type LoginRequest = {
  email: string
  password: string
}
export type ResetPasswordRequest = {
  email: string
  code: string
  password: string
}
export type SendVerificationLinkRequest = {
  email: string
}
export type UserIdResponse = {
  id: number
}
export type AdministrationUnitCategory = {
  id: number
  name: string
  slug: string
}
export type PaginatedAdministrationUnitCategoryList = {
  count?: number
  next?: string | null
  previous?: string | null
  results?: AdministrationUnitCategory[]
}
export type DietCategory = {
  id: number
  name: string
  slug: string
}
export type PaginatedDietCategoryList = {
  count?: number
  next?: string | null
  previous?: string | null
  results?: DietCategory[]
}
export type DonationSourceCategory = {
  id: number
  name: string
  slug: string
}
export type PaginatedDonationSourceCategoryList = {
  count?: number
  next?: string | null
  previous?: string | null
  results?: DonationSourceCategory[]
}
export type EventCategory = {
  id: number
  name: string
  slug: string
}
export type PaginatedEventCategoryList = {
  count?: number
  next?: string | null
  previous?: string | null
  results?: EventCategory[]
}
export type EventGroupCategory = {
  id: number
  name: string
  slug: string
}
export type PaginatedEventGroupCategoryList = {
  count?: number
  next?: string | null
  previous?: string | null
  results?: EventGroupCategory[]
}
export type EventProgramCategory = {
  id: number
  name: string
  slug: string
}
export type PaginatedEventProgramCategoryList = {
  count?: number
  next?: string | null
  previous?: string | null
  results?: EventProgramCategory[]
}
export type GrantCategory = {
  id: number
  name: string
  slug: string
}
export type PaginatedGrantCategoryList = {
  count?: number
  next?: string | null
  previous?: string | null
  results?: GrantCategory[]
}
export type HealthInsuranceCompany = {
  id: number
  name: string
  slug: string
}
export type PaginatedHealthInsuranceCompanyList = {
  count?: number
  next?: string | null
  previous?: string | null
  results?: HealthInsuranceCompany[]
}
export type LocationAccessibilityCategory = {
  id: number
  name: string
  slug: string
}
export type PaginatedLocationAccessibilityCategoryList = {
  count?: number
  next?: string | null
  previous?: string | null
  results?: LocationAccessibilityCategory[]
}
export type LocationProgramCategory = {
  id: number
  name: string
  slug: string
}
export type PaginatedLocationProgramCategoryList = {
  count?: number
  next?: string | null
  previous?: string | null
  results?: LocationProgramCategory[]
}
export type MembershipCategory = {
  id: number
  name: string
  slug: string
}
export type PaginatedMembershipCategoryList = {
  count?: number
  next?: string | null
  previous?: string | null
  results?: MembershipCategory[]
}
export type OpportunityCategory = {
  id: number
  name: string
  description: string
  slug: string
}
export type PaginatedOpportunityCategoryList = {
  count?: number
  next?: string | null
  previous?: string | null
  results?: OpportunityCategory[]
}
export type OrganizerRoleCategory = {
  id: number
  name: string
  slug: string
}
export type PaginatedOrganizerRoleCategoryList = {
  count?: number
  next?: string | null
  previous?: string | null
  results?: OrganizerRoleCategory[]
}
export type PropagationIntendedForCategory = {
  id: number
  name: string
  slug: string
}
export type PaginatedPropagationIntendedForCategoryList = {
  count?: number
  next?: string | null
  previous?: string | null
  results?: PropagationIntendedForCategory[]
}
export type QualificationCategory = {
  id: number
  name: string
  slug: string
  parent?: number | null
}
export type PaginatedQualificationCategoryList = {
  count?: number
  next?: string | null
  previous?: string | null
  results?: QualificationCategory[]
}
export type Region = {
  id: number
  name: string
}
export type PaginatedRegionList = {
  count?: number
  next?: string | null
  previous?: string | null
  results?: Region[]
}
export type RoleCategory = {
  id: number
  name: string
  slug: string
}
export type PaginatedRoleCategoryList = {
  count?: number
  next?: string | null
  previous?: string | null
  results?: RoleCategory[]
}
export type SexCategory = {
  id: number
  name: string
  slug: string
}
export type PaginatedSexCategoryList = {
  count?: number
  next?: string | null
  previous?: string | null
  results?: SexCategory[]
}
export type TeamRoleCategory = {
  id: number
  name: string
  slug: string
}
export type PaginatedTeamRoleCategoryList = {
  count?: number
  next?: string | null
  previous?: string | null
  results?: TeamRoleCategory[]
}
export type Finance = {
  bank_account_number?: string
  grant_category: GrantCategory
  grant_amount?: number | null
  total_event_cost?: number | null
  budget?: string
  receipts: number[]
}
export type VipPropagation = {
  goals_of_event: string
  program: string
  short_invitation_text: string
  rover_propagation?: boolean
}
export type Propagation = {
  is_shown_on_web: boolean
  minimum_age?: number | null
  maximum_age?: number | null
  cost: number
  discounted_cost?: number | null
  intended_for: PropagationIntendedForCategory
  accommodation: string
  diets: DietCategory[]
  organizers: string
  web_url?: string
  _contact_url?: string
  invitation_text_introduction: string
  invitation_text_practical_information: string
  invitation_text_work_description?: string
  invitation_text_about_us?: string
  contact_person?: number | null
  contact_name?: string
  contact_phone?: string
  contact_email?: string
  vip_propagation: VipPropagation | null
}
export type Questionnaire = {
  introduction?: string
  after_submit_text?: string
}
export type Registration = {
  is_registration_required?: boolean
  is_event_full?: boolean
  questionnaire: Questionnaire | null
}
export type Record = {
  total_hours_worked?: number | null
  working_hours?: number | null
  working_days?: number | null
  comment_on_work_done?: string
  attendance_list?: string | null
  participants?: number[]
  number_of_participants?: number | null
  number_of_participants_under_26?: number | null
}
export type Event = {
  id: number
  name: string
  is_canceled?: boolean
  start: string
  end: string
  number_of_sub_events?: number
  location?: number | null
  online_link?: string
  group: EventGroupCategory
  category: EventCategory
  program: EventProgramCategory
  administration_units: number[]
  main_organizer?: number | null
  other_organizers?: number[]
  is_attendance_list_required?: boolean
  is_internal?: boolean
  internal_note?: string
  duration: number
  finance: Finance | null
  propagation: Propagation | null
  registration: Registration | null
  record: Record | null
}
export type PaginatedEventList = {
  count?: number
  next?: string | null
  previous?: string | null
  results?: Event[]
}
export type FinanceReceipt = {
  id: number
  receipt: string
}
export type PaginatedFinanceReceiptList = {
  count?: number
  next?: string | null
  previous?: string | null
  results?: FinanceReceipt[]
}
export type PatchedFinanceReceipt = {
  id?: number
  receipt?: string
}
export type ClosePerson = {
  first_name: string
  last_name: string
  email?: string
  phone?: string
}
export type Donation = {
  donated_at: string
  amount: number
  donation_source: DonationSourceCategory
}
export type Donor = {
  subscribed_to_newsletter?: boolean
  is_public?: boolean
  date_joined: string
  regional_center_support?: number | null
  basic_section_support?: number | null
  variable_symbols: string[]
  donations: Donation[]
}
export type OfferedHelp = {
  programs: EventProgramCategory[]
  organizer_roles: OrganizerRoleCategory[]
  additional_organizer_role?: string
  team_roles: TeamRoleCategory[]
  additional_team_role?: string
  info?: string
}
export type UserAddress = {
  street: string
  city: string
  zip_code: string
  region: Region
}
export type UserContactAddress = {
  street: string
  city: string
  zip_code: string
  region: Region
}
export type Membership = {
  category: MembershipCategory
  administration_unit: number
  year: number
}
export type QualificationApprovedBy = {
  first_name: string
  last_name: string
  email?: string | null
  phone?: string
}
export type Qualification = {
  category: QualificationCategory
  valid_since: string
  valid_till: string
  approved_by: QualificationApprovedBy
}
export type User = {
  id: number
  first_name: string
  last_name: string
  nickname?: string
  display_name: string
  phone?: string
  email?: string | null
  all_emails: string[]
  birthday: string | null
  close_person: ClosePerson | null
  health_insurance_company: HealthInsuranceCompany
  health_issues?: string
  sex: SexCategory
  is_active: boolean
  date_joined: string
  roles: RoleCategory[]
  donor: Donor | null
  offers: OfferedHelp | null
  address: UserAddress
  contact_address: UserContactAddress | null
  memberships: Membership[]
  qualifications: Qualification[]
}
export type PaginatedUserList = {
  count?: number
  next?: string | null
  previous?: string | null
  results?: User[]
}
export type EventPropagationImage = {
  id: number
  order: number
  image: string
}
export type PaginatedEventPropagationImageList = {
  count?: number
  next?: string | null
  previous?: string | null
  results?: EventPropagationImage[]
}
export type PatchedEventPropagationImage = {
  id?: number
  order?: number
  image?: string
}
export type EventPhoto = {
  id: number
  photo: string
}
export type PaginatedEventPhotoList = {
  count?: number
  next?: string | null
  previous?: string | null
  results?: EventPhoto[]
}
export type PatchedEventPhoto = {
  id?: number
  photo?: string
}
export type EventApplicationClosePerson = {
  first_name: string
  last_name: string
  email?: string
  phone?: string
}
export type EventApplicationAddress = {
  street: string
  city: string
  zip_code: string
  region: Region
}
export type EventApplication = {
  id: number
  user?: number | null
  first_name: string
  last_name: string
  nickname?: string
  phone?: string
  email?: string | null
  birthday?: string | null
  health_issues?: string
  sex: SexCategory
  created_at: string
  close_person: EventApplicationClosePerson
  address: EventApplicationAddress
}
export type PaginatedEventApplicationList = {
  count?: number
  next?: string | null
  previous?: string | null
  results?: EventApplication[]
}
export type PatchedEventApplication = {
  id?: number
  user?: number | null
  first_name?: string
  last_name?: string
  nickname?: string
  phone?: string
  email?: string | null
  birthday?: string | null
  health_issues?: string
  sex?: SexCategory
  created_at?: string
  close_person?: EventApplicationClosePerson
  address?: EventApplicationAddress
}
export type Question = {
  id: number
  question: string
  is_required?: boolean
  order?: number
}
export type PaginatedQuestionList = {
  count?: number
  next?: string | null
  previous?: string | null
  results?: Question[]
}
export type PatchedQuestion = {
  id?: number
  question?: string
  is_required?: boolean
  order?: number
}
export type PatchedEvent = {
  id?: number
  name?: string
  is_canceled?: boolean
  start?: string
  end?: string
  number_of_sub_events?: number
  location?: number | null
  online_link?: string
  group?: EventGroupCategory
  category?: EventCategory
  program?: EventProgramCategory
  administration_units?: number[]
  main_organizer?: number | null
  other_organizers?: number[]
  is_attendance_list_required?: boolean
  is_internal?: boolean
  internal_note?: string
  duration?: number
  finance?: Finance | null
  propagation?: Propagation | null
  registration?: Registration | null
  record?: Record | null
}
export type LocationPatron = {
  first_name: string
  last_name: string
  email?: string
  phone?: string
}
export type LocationContactPerson = {
  first_name: string
  last_name: string
  email?: string
  phone?: string
}
export type Location = {
  id: number
  name: string
  description: string
  patron: LocationPatron
  contact_person: LocationContactPerson
  for_beginners?: boolean
  is_full?: boolean
  is_unexplored?: boolean
  program: LocationProgramCategory
  accessibility_from_prague: LocationAccessibilityCategory
  accessibility_from_brno: LocationAccessibilityCategory
  volunteering_work: string
  volunteering_work_done: string
  volunteering_work_goals: string
  options_around: string
  facilities: string
  web?: string
  address?: string
  gps_location?: {
    type?: 'Point'
    coordinates?: number[]
  } | null
  region: Region
}
export type PaginatedLocationList = {
  count?: number
  next?: string | null
  previous?: string | null
  results?: Location[]
}
export type PatchedLocation = {
  id?: number
  name?: string
  description?: string
  patron?: LocationPatron
  contact_person?: LocationContactPerson
  for_beginners?: boolean
  is_full?: boolean
  is_unexplored?: boolean
  program?: LocationProgramCategory
  accessibility_from_prague?: LocationAccessibilityCategory
  accessibility_from_brno?: LocationAccessibilityCategory
  volunteering_work?: string
  volunteering_work_done?: string
  volunteering_work_goals?: string
  options_around?: string
  facilities?: string
  web?: string
  address?: string
  gps_location?: {
    type?: 'Point'
    coordinates?: number[]
  } | null
  region?: Region
}
export type PatchedUser = {
  id?: number
  first_name?: string
  last_name?: string
  nickname?: string
  display_name?: string
  phone?: string
  email?: string | null
  all_emails?: string[]
  birthday?: string | null
  close_person?: ClosePerson | null
  health_insurance_company?: HealthInsuranceCompany
  health_issues?: string
  sex?: SexCategory
  is_active?: boolean
  date_joined?: string
  roles?: RoleCategory[]
  donor?: Donor | null
  offers?: OfferedHelp | null
  address?: UserAddress
  contact_address?: UserContactAddress | null
  memberships?: Membership[]
  qualifications?: Qualification[]
}
export type Opportunity = {
  id: number
  category: OpportunityCategory
  name: string
  start: string
  end: string
  on_web_start: string
  on_web_end: string
  location: number
  introduction: string
  description: string
  location_benefits?: string
  personal_benefits: string
  requirements: string
  contact_name?: string
  contact_phone?: string
  contact_email?: string
  image: string
}
export type PaginatedOpportunityList = {
  count?: number
  next?: string | null
  previous?: string | null
  results?: Opportunity[]
}
export type PatchedOpportunity = {
  id?: number
  category?: OpportunityCategory
  name?: string
  start?: string
  end?: string
  on_web_start?: string
  on_web_end?: string
  location?: number
  introduction?: string
  description?: string
  location_benefits?: string
  personal_benefits?: string
  requirements?: string
  contact_name?: string
  contact_phone?: string
  contact_email?: string
  image?: string
}
export type AdministrationUnit = {
  id: number
  name: string
  abbreviation: string
  is_for_kids: boolean
  phone: string
  email: string
  www?: string
  ic?: string
  address: string
  contact_address: string
  bank_account_number?: string
  existed_since?: string | null
  existed_till?: string | null
  category: AdministrationUnitCategory
  chairman: User
  vice_chairman: User
  manager: User
  board_members: User[]
}
export type PaginatedAdministrationUnitList = {
  count?: number
  next?: string | null
  previous?: string | null
  results?: AdministrationUnit[]
}
export const {
  useAuthLoginCreateMutation,
  useAuthResetPasswordCreateMutation,
  useAuthSendVerificationLinkCreateMutation,
  useAuthWhoamiRetrieveQuery,
  useCategoriesAdministrationUnitCategoriesListQuery,
  useCategoriesAdministrationUnitCategoriesRetrieveQuery,
  useCategoriesDietCategoriesListQuery,
  useCategoriesDietCategoriesRetrieveQuery,
  useCategoriesDonationSourceCategoriesListQuery,
  useCategoriesDonationSourceCategoriesRetrieveQuery,
  useCategoriesEventCategoriesListQuery,
  useCategoriesEventCategoriesRetrieveQuery,
  useCategoriesEventGroupCategoriesListQuery,
  useCategoriesEventGroupCategoriesRetrieveQuery,
  useCategoriesEventProgramCategoriesListQuery,
  useCategoriesEventProgramCategoriesRetrieveQuery,
  useCategoriesGrantCategoriesListQuery,
  useCategoriesGrantCategoriesRetrieveQuery,
  useCategoriesHealthInsuranceCompaniesListQuery,
  useCategoriesHealthInsuranceCompaniesRetrieveQuery,
  useCategoriesLocationAccessibilityCategoriesListQuery,
  useCategoriesLocationAccessibilityCategoriesRetrieveQuery,
  useCategoriesLocationProgramCategoriesListQuery,
  useCategoriesLocationProgramCategoriesRetrieveQuery,
  useCategoriesMembershipCategoriesListQuery,
  useCategoriesMembershipCategoriesRetrieveQuery,
  useCategoriesOpportunityCategoriesListQuery,
  useCategoriesOpportunityCategoriesRetrieveQuery,
  useCategoriesOrganizerRoleCategoriesListQuery,
  useCategoriesOrganizerRoleCategoriesRetrieveQuery,
  useCategoriesPropagationIntendedForCategoriesListQuery,
  useCategoriesPropagationIntendedForCategoriesRetrieveQuery,
  useCategoriesQualificationCategoriesListQuery,
  useCategoriesQualificationCategoriesRetrieveQuery,
  useCategoriesRegionsListQuery,
  useCategoriesRegionsRetrieveQuery,
  useCategoriesRoleCategoriesListQuery,
  useCategoriesRoleCategoriesRetrieveQuery,
  useCategoriesSexCategoriesListQuery,
  useCategoriesSexCategoriesRetrieveQuery,
  useCategoriesTeamRoleCategoriesListQuery,
  useCategoriesTeamRoleCategoriesRetrieveQuery,
  useFrontendEventsListQuery,
  useFrontendEventsCreateMutation,
  useFrontendEventsFinanceReceiptsListQuery,
  useFrontendEventsFinanceReceiptsCreateMutation,
  useFrontendEventsFinanceReceiptsRetrieveQuery,
  useFrontendEventsFinanceReceiptsUpdateMutation,
  useFrontendEventsFinanceReceiptsPartialUpdateMutation,
  useFrontendEventsFinanceReceiptsDestroyMutation,
  useFrontendEventsOrganizersListQuery,
  useFrontendEventsOrganizersRetrieveQuery,
  useFrontendEventsPropagationImagesListQuery,
  useFrontendEventsPropagationImagesCreateMutation,
  useFrontendEventsPropagationImagesRetrieveQuery,
  useFrontendEventsPropagationImagesUpdateMutation,
  useFrontendEventsPropagationImagesPartialUpdateMutation,
  useFrontendEventsPropagationImagesDestroyMutation,
  useFrontendEventsRecordParticipantsListQuery,
  useFrontendEventsRecordParticipantsRetrieveQuery,
  useFrontendEventsRecordPhotosListQuery,
  useFrontendEventsRecordPhotosCreateMutation,
  useFrontendEventsRecordPhotosRetrieveQuery,
  useFrontendEventsRecordPhotosUpdateMutation,
  useFrontendEventsRecordPhotosPartialUpdateMutation,
  useFrontendEventsRecordPhotosDestroyMutation,
  useFrontendEventsRegisteredListQuery,
  useFrontendEventsRegisteredRetrieveQuery,
  useFrontendEventsRegistrationApplicationsListQuery,
  useFrontendEventsRegistrationApplicationsCreateMutation,
  useFrontendEventsRegistrationApplicationsRetrieveQuery,
  useFrontendEventsRegistrationApplicationsUpdateMutation,
  useFrontendEventsRegistrationApplicationsPartialUpdateMutation,
  useFrontendEventsRegistrationApplicationsDestroyMutation,
  useFrontendEventsRegistrationQuestionnaireQuestionsListQuery,
  useFrontendEventsRegistrationQuestionnaireQuestionsCreateMutation,
  useFrontendEventsRegistrationQuestionnaireQuestionsRetrieveQuery,
  useFrontendEventsRegistrationQuestionnaireQuestionsUpdateMutation,
  useFrontendEventsRegistrationQuestionnaireQuestionsPartialUpdateMutation,
  useFrontendEventsRegistrationQuestionnaireQuestionsDestroyMutation,
  useFrontendEventsRetrieveQuery,
  useFrontendEventsUpdateMutation,
  useFrontendEventsPartialUpdateMutation,
  useFrontendEventsDestroyMutation,
  useFrontendLocationsListQuery,
  useFrontendLocationsCreateMutation,
  useFrontendLocationsRetrieveQuery,
  useFrontendLocationsUpdateMutation,
  useFrontendLocationsPartialUpdateMutation,
  useFrontendLocationsDestroyMutation,
  useFrontendUsersListQuery,
  useFrontendUsersCreateMutation,
  useFrontendUsersRetrieveQuery,
  useFrontendUsersUpdateMutation,
  useFrontendUsersPartialUpdateMutation,
  useFrontendUsersDestroyMutation,
  useFrontendUsersEventsWhereWasOrganizerListQuery,
  useFrontendUsersEventsWhereWasOrganizerRetrieveQuery,
  useFrontendUsersOpportunitiesListQuery,
  useFrontendUsersOpportunitiesCreateMutation,
  useFrontendUsersOpportunitiesRetrieveQuery,
  useFrontendUsersOpportunitiesUpdateMutation,
  useFrontendUsersOpportunitiesPartialUpdateMutation,
  useFrontendUsersOpportunitiesDestroyMutation,
  useFrontendUsersParticipatedInEventsListQuery,
  useFrontendUsersParticipatedInEventsRetrieveQuery,
  useFrontendUsersRegisteredInEventsListQuery,
  useFrontendUsersRegisteredInEventsRetrieveQuery,
  useWebAdministrationUnitsListQuery,
  useWebAdministrationUnitsRetrieveQuery,
  useWebEventsListQuery,
  useWebEventsRetrieveQuery,
  useWebOpportunitiesListQuery,
  useWebOpportunitiesRetrieveQuery,
} = injectedRtkApi
