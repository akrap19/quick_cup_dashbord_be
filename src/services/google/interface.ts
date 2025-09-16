import { PlaceAutocompleteType } from "@googlemaps/google-maps-services-js"

export enum SearchPlacesType {
  address = PlaceAutocompleteType.address,
  cities = PlaceAutocompleteType.cities,
  establishment = PlaceAutocompleteType.establishment,
  geocode = PlaceAutocompleteType.geocode,
  regions = PlaceAutocompleteType.regions
}