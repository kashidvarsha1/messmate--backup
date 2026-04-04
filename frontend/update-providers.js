// update-providers.js
// MongoDB script to add publicId to all providers

// Connect to messmate database
db = db.getSiblingDB('messmate');

print("========================================");
print("Provider Public ID Update Script");
print("Database: messmate");
print("========================================\n");

// Find all providers without publicId
var providers = db.providers.find({ publicId: { $exists: false } }).toArray();

print("Found " + providers.length + " providers to update\n");

if (providers.length === 0) {
    print("All providers already have publicId! No updates needed.");
    quit();
}

// Preview first 5 updates
print("Preview of updates (first 5):");
for (var i = 0; i < Math.min(5, providers.length); i++) {
    var p = providers[i];
    var name = p.name || "Unknown";
    
    // Generate slug
    var slug = name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .replace(/^-|-$/g, '');
    
    if (slug === "") slug = "provider";
    
    // Get ObjectId as string and take first 8 chars
    var idString = p._id.toString();
    var idPart = idString.substring(0, 8);
    var publicId = slug + "-" + idPart;
    
    print("  " + (i+1) + ". " + name + " -> " + publicId);
}

print("\nUpdating providers...\n");

// Update all providers
var updated = 0;
var errors = 0;

providers.forEach(function(provider) {
    try {
        var name = provider.name || "Unknown";
        
        // Generate slug
        var slug = name.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-')
            .replace(/^-|-$/g, '');
        
        if (slug === "") slug = "provider";
        
        // Get ObjectId as string and take first 8 chars
        var idString = provider._id.toString();
        var idPart = idString.substring(0, 8);
        var publicId = slug + "-" + idPart;
        
        // Update the document
        var result = db.providers.updateOne(
            { _id: provider._id },
            { $set: { publicId: publicId } }
        );
        
        if (result.modifiedCount === 1) {
            updated++;
            print("  ✓ Updated: " + name + " -> " + publicId);
        } else {
            errors++;
            print("  ✗ No change: " + name);
        }
    } catch(e) {
        errors++;
        print("  ✗ Failed: " + (provider.name || "Unknown") + " - " + e.message);
    }
});

print("\n========================================");
print("UPDATE SUMMARY");
print("========================================");
print("Total providers found: " + providers.length);
print("Successfully updated: " + updated);
print("Errors: " + errors);
print("\n✅ All providers now have a publicId field!");

// Show sample of updated data
print("\nSample of updated data:");
var sample = db.providers.findOne({}, {name: 1, publicId: 1, _id: 1});
if (sample) {
    print("  Name: " + sample.name);
    print("  PublicId: " + sample.publicId);
    print("  Old _id: " + sample._id);
}
